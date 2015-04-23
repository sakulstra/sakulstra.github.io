android studio on ubuntu 14.10, 15.04
=====================================
Since the newer ubuntu versions u can simply install android studio via ubuntu-developer-tools-center.

.. code-block:: shell
	
	sudo apt-get install ubuntu-developer-tools-center
	udtc android

Can u? I got an error caused by a bug in the python script as reported on `launchpad`_.

The fix is listed in one of the comments below but i'll post it here, so u don't have to dig for it.
Open the python file with admin rights:

.. code-block:: shell

	sudo nano /usr/lib/python3/dist-packages/udtc/frameworks/android.py

and change the following lines(57,58,87)

.. code-block:: python
	
	#replace 1st with 2nd
	p = re.search(r'href="(.*)">', line)
	p = re.search(r'href="(.*)"', line)
	
	p = re.search(r'<td>(\w+)</td>', line)
	p = re.search(r'<td>([0-9a-f]+)</td>', line)

	return self.category.parse_download_link('id="linux-studio"', line, in_download)
        return self.category.parse_download_link('id="linux-bundle"', line, in_download)


.. _launchpad: https://bugs.launchpad.net/ubuntu/+source/ubuntu-developer-tools-center/+bug/1400536

.. author:: default
.. categories:: errors,android
.. tags:: android
.. comments::
