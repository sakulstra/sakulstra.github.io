arduino permission denied
=========================
When using windows programs on linux there are always permission problems... and most often they are really simple to fix :)

When getting a:

.. code-block:: cpp
	
	Method name - openPort(); Exception type - Permission denied.

error while trying to upload programs the simple fix is to add the user to the dialout group like that:

.. code-block:: shell
	
	sudo adduser username dialout

important:
^^^^^^^^^^
After doing this you have to logout and login again to take effect of the changes!!!

hint:
^^^^^^^^^^
I read about people still having problems with some ports.
An ugly fix for that would be the editing of file-permission rights.

.. code-block:: shell
	
	sudo chmod a+rw theport		#sth. like /dev/ttyACM0


.. author:: default
.. categories:: none
.. tags:: none
.. comments::
