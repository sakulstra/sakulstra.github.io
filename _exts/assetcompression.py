#Author: Lukas Strassel
#Extension for asset compression in tinkerer
#The proposed solution is based on http://swiftbend.com/blog/?page_id=79#.VTJTKOT7vtQ
from slimit import minify
from rcssmin import cssmin

import glob
import os


destPath = os.getcwd()+"/blog/html/_static"
jsFiles = []
cssFiles = []

def minifyCSSProc(srcText):
    return cssmin(srcText, keep_bang_comments=True)

def minifyJSProc(srcText):
    return minify(srcText, mangle=True, mangle_toplevel=True)

def processFiles(minifyProc, sourcePaths):
    for srcFile in sourcePaths:
        with open(srcFile,'r+') as inputFile:
        	srcText = inputFile.read()
                minText = minifyProc(srcText)
		inputFile.close()
		os.remove(destPath+"/"+srcFile)
		file = open(destPath+"/"+srcFile, 'w+')
		file.write(minText)
		file.close()

def jsMinification(files):
    return processFiles(minifyJSProc, files)

def cssMinification(files):
    return processFiles(minifyCSSProc, files)

def setup(app):
	app.connect("build-finished", asset_compression)

def asset_compression(app, exception):
	destPath = os.getcwd()+"/blog/html/_static"
	os.chdir(destPath)
	jsFiles = glob.glob("*.js")
	jsFiles.remove("disqus.js")
	print jsFiles
	cssFiles = glob.glob("*.css")
        jsMinification(jsFiles)
        cssMinification(cssFiles)
	
