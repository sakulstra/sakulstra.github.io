Going crazy with biicode and arduino
====================================
Coding in Arduino IDE has always been really messy due to the fact,
that Arduino IDE hat no auto-complete,
some awkward java/c mix programming language and an even worse file managing system
(it isn't even possible to use subdirectorys without problems).
So at this point of awareness, most people try to use Eclipse which solves some of the problems mentioned above,
but u still won't be able to use c/c++ and the subdirectory problem still exists.

So this is the moment to give biicode_ a try:

Simply install biicode via `download biicode`_ and you're ready to start. First we'll write
a program to serial read from our arduino:

.. code-block:: c

  #include "david/serial_cpp/serial.h"
  #include <string>
  #include <iostream>
  using namespace std;
  int main()
  {
  string input = "";
  //start tag, seperator, endtag, baudrate
  serial serialport('$', '\n', "COM4", 115200);
  while(1){
    if(input = serialport.read()) != "")
      cout << input << "\n";
  }

| The magic is done.
| David's serial library expects a starting character and an end character which is a pretty good practice for package alignment.
| Let's enjoy the result - we only have to compile and run the application.

.. code-block:: c

  bii find      #downloads dependencies
  bii cpp:build #builds the project

Now there should be an executable in your bin/ folder.

.. _download biicode: http://www.biicode.com/downloads
.. _biicode: http://biicode.com

.. author:: Lukas Strassel
.. categories:: arduino
.. tags:: biicode,arduino,cpp
.. comments::
