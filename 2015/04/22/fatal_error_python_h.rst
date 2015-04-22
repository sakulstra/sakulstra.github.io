fatal error: Python.h
=====================

Did u ever get a not found the error for Python.h while installing packages?

.. code-block:: cpp

	#include "Python.h"
		            ^
	compilation terminated.


in most cases the reason is a missing package.

.. code-block:: shell
	
	sudo apt-get install python2.7-dev libyaml-dev

should be the solution.

.. author:: default
.. categories:: errors
.. tags:: python
.. comments::
