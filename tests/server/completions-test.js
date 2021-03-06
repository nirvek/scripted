/*******************************************************************************
 * @license
 * Copyright (c) 2012 VMware, Inc. All Rights Reserved.
 * THIS FILE IS PROVIDED UNDER THE TERMS OF THE ECLIPSE PUBLIC LICENSE
 * ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION OF THIS FILE
 * CONSTITUTES RECIPIENTS ACCEPTANCE OF THE AGREEMENT.
 * You can obtain a current copy of the Eclipse Public License from
 * http://www.opensource.org/licenses/eclipse-1.0.php
 *
 * Contributors:
 *     Andrew Eisenberg - initial API and implementation
 ******************************************************************************/

/*jslint node:true */
/*global require exports __dirname console */

//To run this test do this on the commandline:

//1) install nodeunit:
// 'cd ~'
// 'npm install nodeunit'
//2) run the tests
// 'cd <this-directory>'
// 'nodeunit <this-filename>'

var completionsModule = require("../../server/templates/completions");
//var testResourcesFolder = process.cwd() + "/test-resources/";
var testResourcesFolder = __dirname + "/test-resources/";


var assertEqualArrays = require('./test-utils').assertEqualArrays;

exports.extractScope = function(test) {
	var completionsProcessor = new completionsModule.CompletionsProcessor();
	test.equals("html", completionsProcessor.extractScope("text.html - source - meta.tag, punctuation.definition.tag.begin"));
	test.equals("js", completionsProcessor.extractScope("source.js - source - meta.tag, punctuation.definition.tag.begin"));
	test.equals(null, completionsProcessor.extractScope("- source - meta.tag, punctuation.definition.tag.begin"));
	test.equals(null, completionsProcessor.extractScope(null));
	test.done();
};

// no test is too silly!
exports.findCompletionsFiles = function(test) {
	var completionsProcessor = new completionsModule.CompletionsProcessor(testResourcesFolder);
	completionsProcessor.findCompletionsFiles(
		function(files) {
			var expect = [1,2,3].map(function (i) {
				return testResourcesFolder + "test"+i+".scripted-completions";
			});
			assertEqualArrays(test, expect, files);
			test.done();
		},
		function(err) {
			console.trace('here');
			test.fail(err);
			test.done();
		}
	);
};

exports.findCompletions = function(test) {
	var errback = function(err) {
		if (err.stack) {
			console.log(err);
			console.log(err.stack);
		}
		test.fail(err);
		test.done();
	};

	var completionsProcessor = new completionsModule.CompletionsProcessor(testResourcesFolder);
	completionsProcessor.findCompletions(
		testResourcesFolder + "test1.scripted-completions").then(
		function(res) {
			var completions = res.completions;
			test.equals(completions.length, 5);

			var completion = '<a href="arg1"></a>';
			test.equals(completions[0].proposal, completion);
			test.equals(completions[0].description, completions[0].trigger + " : " + completion);
			test.equals(completions[0].trigger, "a");
			test.deepEqual(completions[0].positions, [{offset:completion.indexOf("arg1"), length:"arg1".length}]);
			test.equals(completions[0].escapePosition, completion.indexOf("</a>"));
			
			completion = '<abbr></abbr>';
			test.equals(completions[1].proposal, completion);
			test.equals(completions[1].description, completions[1].trigger + " : " + completion);
			test.equals(completions[1].trigger, "abbr");
			test.deepEqual(completions[1].positions, []);
			test.equals(completions[1].escapePosition, completion.indexOf("</abbr>"));
			
			completion = '<acronym></acronym>';
			test.equals(completions[2].proposal, completion);
			test.equals(completions[2].description, completions[2].trigger + " : " + completion);
			test.equals(completions[2].trigger, "acronym");
			test.deepEqual(completions[2].positions, []);
			test.equals(completions[2].escapePosition, completion.indexOf("</acronym>"));
			
			completion = '<acronym>arg1</acronym>';
			test.equals(completions[3].proposal, completion);
			test.equals(completions[3].description, completions[3].trigger + " : " + completion);
			test.equals(completions[3].trigger, "acronym");
			test.deepEqual(completions[3].positions, [{offset:completion.indexOf("arg1"), length:"arg1".length}]);
			test.equals(completions[3].escapePosition, completion.indexOf("</acronym>"));
			
			completion = '<acronym>arg1arg2</acronym>';
			test.equals(completions[4].proposal, completion);
			test.equals(completions[4].description, completions[4].trigger + " : " + completion);
			test.equals(completions[4].trigger, "acronym");
			test.deepEqual(completions[4].positions, [{offset:completion.indexOf("arg1"), length:"arg1".length}, {offset:completion.indexOf("arg2"), length:"arg2".length}]);
			test.equals(completions[4].escapePosition, completion.indexOf("</acronym>"));
			
		}, errback);
		
	completionsProcessor.findCompletions(
		testResourcesFolder + "test2.scripted-completions").then(
		function(res) {
			var completions = res.completions;
			test.equals(completions.length, 4);
			var i = 0;
			var completion = '<acronym>arg1arg2</acronym>';
			test.equals(completions[i].proposal, completion);
			test.equals(completions[i].description, completions[i].trigger + " : " + completion);
			test.equals(completions[i].trigger, "acronym");
			test.deepEqual(completions[i].positions, [{offset:completion.indexOf("arg1"), length:"arg1".length}, {offset:completion.indexOf("arg2"), length:"arg2".length}]);
			test.equals(completions[i].escapePosition, completion.indexOf("arg1"));
			i++;
			
			completion = 'arg1<acronym></acronym>arg2';
			test.equals(completions[i].proposal, completion);
			test.equals(completions[i].description, completions[i].trigger + " : " + completion);
			test.equals(completions[i].trigger, "acronym");
			test.deepEqual(completions[i].positions, [{offset:completion.indexOf("arg1"), length:"arg1".length}, {offset:completion.indexOf("arg2"), length:"arg2".length}]);
			test.equals(completions[i].escapePosition, completion.indexOf("</acronym>"));
			i++;
			
			completion = 'arg2<acronym></acronym>arg1';
			test.equals(completions[i].proposal, completion);
			test.equals(completions[i].description, completions[i].trigger + " : " + completion);
			test.equals(completions[i].trigger, "acronym");
			test.deepEqual(completions[i].positions, [
				{offset:completion.indexOf("arg1"), length:"arg1".length},
				{offset:completion.indexOf("arg2"), length:"arg2".length}
			]);
			test.equals(completions[i].escapePosition, completion.indexOf("</acronym>"));
			i++;
			
			completion = 'arg2<acronym></acronym>arg1';
			test.equals(completions[i].proposal, completion);
			test.equals(completions[i].description, completions[i].trigger + " : " + completion);
			test.equals(completions[i].trigger, "acronym");
			test.deepEqual(completions[i].positions, [
				{offset:completion.indexOf("arg1"), length:"arg1".length},
				{offset:completion.indexOf("arg2"), length:"arg2".length}
			]);
			test.equals(completions[i].escapePosition, completion.length);
			i++;
			
		}, errback);
		
	completionsProcessor.findCompletions(
		testResourcesFolder + "test3.scripted-completions").then(
		function(res) {
			var completions = res.completions;
			// last two completions are invalid
			test.equals(completions.length, 7);
			var i = 0;
			var completion = '<acronym>foo</acronym>';
			test.equals(completions[i].proposal, completion);
			test.equals(completions[i].description, completions[i].trigger + " : " + completion);
			test.equals(completions[i].trigger, "acronym");
			test.deepEqual(completions[i].positions, [{offset:completion.indexOf("foo"), length:"foo".length}]);
			test.equals(completions[i].escapePosition, completion.length);
			i++;
			
			completion = 'foo<acronym></acronym>';
			test.equals(completions[i].proposal, completion);
			test.equals(completions[i].description, completions[i].trigger + " : " + completion);
			test.equals(completions[i].trigger, "acronym");
			test.deepEqual(completions[i].positions, [{offset:completion.indexOf("foo"), length:"foo".length}]);
			test.equals(completions[i].escapePosition, completion.length);
			i++;
			
			completion = '<acronym></acronym>foo';
			test.equals(completions[i].proposal, completion);
			test.equals(completions[i].description, completions[i].trigger + " : " + completion);
			test.equals(completions[i].trigger, "acronym");
			test.deepEqual(completions[i].positions, [{offset:completion.indexOf("foo"), length:"foo".length}]);
			test.equals(completions[i].escapePosition, completion.length);
			i++;
			
			completion = '<acronym>foobar</acronym>';
			test.equals(completions[i].proposal, completion);
			test.equals(completions[i].description, completions[i].trigger + " : " + completion);
			test.equals(completions[i].trigger, "acronym");
			test.deepEqual(completions[i].positions, [
				{offset:completion.indexOf("foo"), length:"foo".length},
				{offset:completion.indexOf("bar"), length:"bar".length}
			]);
			test.equals(completions[i].escapePosition, completion.indexOf("</acronym>"));
			i++;
			
			completion = 'bar<acronym></acronym>fooarg3';
			test.equals(completions[i].proposal, completion);
			test.equals(completions[i].description, completions[i].trigger + " : " + completion);
			test.equals(completions[i].trigger, "acronym");
			test.deepEqual(completions[i].positions, [
				{offset:completion.indexOf("foo"), length:"foo".length},
				{offset:completion.indexOf("bar"), length:"bar".length},
				{offset:completion.indexOf("arg3"), length:"arg3".length}
			]);
			test.equals(completions[i].escapePosition, completion.indexOf("</acronym>"));
			i++;
			
			completion = '${bar}';
			test.equals(completions[i].proposal, completion);
			test.equals(completions[i].description, completions[i].trigger + " : " + completion);
			test.equals(completions[i].trigger, "acronym");
			test.deepEqual(completions[i].positions, []);
			test.equals(completions[i].escapePosition, completion.length);
			i++;
			
			completion = '$bar';
			test.equals(completions[i].proposal, completion);
			test.equals(completions[i].description, completions[i].trigger + " : " + completion);
			test.equals(completions[i].trigger, "acronym");
			test.deepEqual(completions[i].positions, []);
			test.equals(completions[i].escapePosition, completion.length);
			i++;
			
			test.done();
		}, errback);
};

//exports.convertCompletion