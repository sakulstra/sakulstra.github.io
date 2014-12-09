Gesture recognition with Arduino
================================
There's a (not so)new star out in the endless wideness of open source software.
GRT_ by `Nick Gillian`_ is a gesture recognition library with a rich collection of pre and post processing filter besides a huge variety of build in gesture recognition algorithms.

The GRT library itself is currently published on biicode, but the GRT-GUI isn't cause it's highly dependent on qt. So what we want to do now is creating a pipeline from Arduino to GRT-GUI.

The GRT-GUI was designed to communicate via OSC, but we usually use serial communication at arduino/hardware-side. This forces us to read from serial and forward via OSC to GRT.

The following program consists of 3 parts:
 #. establishing a serial connection to your arduino
 #. Continuously read data from serial
 #. use GRT-GUI to read and process the data

.. code-block:: c

  #include <string>
  #include <iostream>
  #include <stdlib.h>
  #include "david/serial_cpp/serial.h"
  #include "Maria/oscpack/osc/OscOutboundPacketStream.h"
  #include "Maria/oscpack/ip/UdpSocket.h"

  #define ADDRESS "127.0.0.1"
  #define PORT 5000
  #define OUTPUT_BUFFER_SIZE 1024
  #define COMPORT "/dev/ttyUSB0"
  #define BAUDRATE 115200

  using namespace std;

  int main()
  {
    //open udp socket for osc
    UdpTransmitSocket transmitSocket( IpEndpointName( ADDRESS, PORT ) );
    //open serialport for arduino communication
    //expects arduino messages in following form: $value1\tvalue2\tvalue2\n
    serial serialport('$', '\n', COMPORT, BAUDRATE);
    string input = "";
    while(1){
      input = serialport.read(); //read a message
      if (input != ""){
        //begin OSC message
        char buffer[OUTPUT_BUFFER_SIZE];
        osc::OutboundPacketStream p( buffer, OUTPUT_BUFFER_SIZE );
        p << osc::BeginBundleImmediate << osc::BeginMessage( "/Data" );


        char seps[] = "\t";
        char *token;
        //token points to &input
        token = strtok( &input[0], seps );
        while( token != NULL )
        {
          //add value inside token to osc message
          p << atof(token);
          //token points to next occurence
          token = strtok( NULL, seps );
        }
        //end osc message
        p << osc::EndMessage << osc::EndBundle;
        //send message via udp
        transmitSocket.Send( p.Data(), p.Size() );
      }
    }
    return 0;
  }

Biicode leverages this process by reducing the pain of downloading and compiling external dependencies. With a simple:

.. code-block:: c

  bii find      #downloads dependencies
  bii cpp:build #builds the project

we can start our program and you will hopefully see the data-stream in GRT-GUI.

.. _GRT: https://github.com/nickgillian/grt
.. _Nick Gillian: http://www.nickgillian.com

.. author:: Lukas Strassel
.. categories:: biicode, arduino
.. tags:: none
.. comments::
