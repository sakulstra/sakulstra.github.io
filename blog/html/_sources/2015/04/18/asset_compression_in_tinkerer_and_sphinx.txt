asset compression in tinkerer and sphinx
========================================
Asset compression is a major concern for nearly every complex web framework.
Interestingly most static page frameworks don't care about this, cause server response rates are blazing fast so asset compression for css, js and image resources is not worth the effort.

This may be right in most cases, but especially in bad internet countries and even in suburban regions where the internet speed is reduced to dsl 1k and less it's important to keep package size to a minimum.

In order to reduce server response time and package size i created a simple tinkerer extension, which can also be used 
for sphinx with slight adjustments. Is simply takes the generated resources and overwrites them with their minified versions

.. code-block:: python

	#Author: Lukas Strassel
	#Extension for asset compression in tinkerer
	#The proposed solution is based on http://swiftbend.com/blog/?page_id=79#.VTJTKOT7vtQ
	from slimit import minify
	from rcssmin import cssmin

	import glob
	import os


	destPath = os.getcwd()+"/blog/html/_static"	#get path to static files(may be wrong for sphinx)
	jsFiles = []		#container for js resources
	cssFiles = []		#container for css resources

	def minifyCSSProc(srcText):
	    return cssmin(srcText, keep_bang_comments=True)

	def minifyJSProc(srcText):
	    return minify(srcText, mangle=True, mangle_toplevel=True)

	def processFiles(minifyProc, sourcePaths):
	    for srcFile in sourcePaths:
		with open(srcFile,'r+') as inputFile:		#open file
			srcText = inputFile.read()		#read file
		        minText = minifyProc(srcText)		#minimize resources
			inputFile.close()			#close file
			os.remove(destPath+"/"+srcFile)		#remove file
		
			file = open(destPath+"/"+srcFile, 'w+')	#create new file
			file.write(minText)			#write minimized content
			file.close()				#close file

	def jsMinification(files):
	    return processFiles(minifyJSProc, files)

	def cssMinification(files):
	    return processFiles(minifyCSSProc, files)

	def setup(app):
		app.connect("build-finished", asset_compression)#inject after build-finished to modify the generated(not original) resources

	def asset_compression(app, exception):
		os.chdir(destPath)				#change working directory
		jsFiles = glob.glob("*.js")			#find all js files
		jsFiles.remove("disqus.js")			#disqus wont't work minimized, cause the function names are used in the layout
		cssFiles = glob.glob("*.css")			#find all css files
		jsMinification(jsFiles)				#minify js
		cssMinification(cssFiles)			#minify css

.. author:: Lukas Strassel
.. categories:: tinkerer
.. tags:: tinkerer, asset_compression
.. comments::
