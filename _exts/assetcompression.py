#Author: Lukas Strassel
#Extension for asset compression in tinkerer
#The proposed solution is based on http://swiftbend.com/blog/?page_id=79#.VTJTKOT7vtQ
from slimit import minify
from rcssmin import cssmin

import glob
import os

jsFiles = []		#container for js resources
cssFiles = []		#container for css resources
destPath = os.getcwd()+"/blog/html/_static"	#get path to static files(may be wrong for sphinx)

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
	
