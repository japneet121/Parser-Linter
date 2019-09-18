'use strict';
import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.languages.registerHoverProvider('sumoparse', {
        provideHover(document, position, token) {

            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);
            return returnHoverInfo(word);
          
            }
        },
    );
    const collection = vscode.languages.createDiagnosticCollection('test');
    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document, collection);
    }
    context.subscriptions.push(disposable,vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDiagnostics(editor.document, collection);
        }
    }));
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
        updateDiagnostics(document, collection);
    });
    
}

function returnHoverInfo(word:string){
    if (word == "ALIAS") {
        return new vscode.Hover({language:"ALIAS",
        value:"ALIAS:<old_field_name> = <alias_field_name>\n\
default = none\n\
<old_field_name> and <new_field_name> are required\n\
Creates a read only reference between alias_field_name and old_field_name.\n\
Note if the value of <old_field_name> is None, it will not create the alias.\n"
	})

    }
    else if (word == "SET"){
        return new vscode.Hover({
            language: "SET",
            value: "default = none\nsets field to this value\nThe field name is treated as a Mustache template if it contains two curly braces '{{'. The template can access any event fields that have been parsed prior to this instruction. For example, Response_{{_match_count}} would set the field named Response_0 if the _match_count field was set to 0."
		})
	
	}
	else if (word == "BURNDOWN_FACTOR"){
		return new vscode.Hover({language:"BURNDOWN",
        value:"BURNDOWN_FACTOR = <factor_type>\n\
default = none\n\
\n\
Declares that an investigation will be created from every event with the declared factor type. An investigation is a tracking construct to track a security incident to resolution."})
	}

	else if (word == "FORMAT"){
		return new vscode.Hover({language:"FORMAT",
        value:"FORMAT = <format_type>\n\
default = REGEX\n\
one of REGEX, CSV, JSON, XML\n\
Specifies the overall format of the messages being parsed."})
	}

	else if (word == "FACTOR"){
		return new vscode.Hover({language:"FACTOR",
        value:"FACTOR:<factor_type>:<required_fields> = <field_name>, <field_name>, ...\n\
default = none\n\
\n\
factor_type can be Endpoint, Identity, Network, Application, Threat, Alerts, or Operational. For additional information, see Factoring chapter.\n\
\n\
The values from the list of fields specified on any side will be merged with any definition of this factor that already exists in the event.\n\
\n\
<required_fields> is a list of fields required for the factor, separated by commas. If a field is listed in this list, it does not have to be mentioned on the right side. There is a way to indicate that at least one field out  a group of fields is required: enclose the group in parentheses. For example:\n\
\n\
FACTOR:Identity:(userIdentity_userName, userIdentifty_principalId_actorName), sourceIPAddress = userIdentity_userName, userIdentity_principalId_actorName, sourceIPAddress\n\
\n\
<field_name> is in either of the following forms:\n\
- a string matching a field name in the given event, in which case only that field with the matching name will be added to the factor.\n\
	- r|<regex> in which case all field names matching the regex will be added to the factor."})
	}
	else if (word == "FIELD_TYPE"){
		return new vscode.Hover({language:"FIELD_TYPE",
        value:"FIELD_TYPE:<field_name> = <field_type>\n\
default = none\n\
Marks the given field as a link field and specifies the link type.\n\
<field_name> is in either of the following forms:\n\
a string matching a field name in the given event, in which case only that field with the matching name will have its type set.\n\
	r|<regex> in which case all field names matching the regex will have their types set.\n\
Special Cases:\n\
If <field_type> is set to “None”, then that field will be set to ignore any FIELD_TYPE statements after it, leaving matching fields untyped.\n\
Order of Application:\n\
Field types are applied in the order they are listed, with field types being based on the first set field type for a given field. However, field types based on regexes are applied after types based on a string matching a field name in the given event."})
	}
	else if (word == "HUB"){
		return new vscode.Hover({language:"HUB",
        value:"HUB:<field_name> = <hub description>\n\
Marks the field as a hub with the description provided. This makes it so that the field won’t be given a recursive query in IW, but  will still appear as a link. An example of a good use of a hub would be for a log collection system, syslog aggregators, SiteProtector, or McAfee ePolicy Orchestrator’s IPs or Hosts,"})
	}
	else if (word == "START_TIME_HANDLING"){
		return new vscode.Hover({language:"START_TIME_HANDLING",
        value:"	START_TIME_HANDLING = <GIVEN|ROUND|CONSTANT>\n\
default = GIVEN\n\
if GIVEN, ignore DEFAULT_START_TIME, start time defaults to current time on parsing machine\n\
if ROUND, round start down using DEFAULT_START_TIME as the rounding increment in milliseconds, start time defaults to current time on parsing machine\n\
if CONSTANT, treat DEFAULT_START_TIME as an ISO 8601 or a UNIX timestamp, set start time to this time; if missing, start time defaults to current time on parsing machine\n\
ROUND can also be set to the strings MINUTE, HOUR, DAY, and WEEK, which will result in the appropriate number of milliseconds being used."})
	}
	else if (word == "DEFAULT_START_TIME"){
		return new vscode.Hover({language:"DEFAULT_START_TIME",
value:"DEFAULT_START_TIME = <time>\n\
default = none\n\
value is used in various ways depending on the START_TIME setting."})
	}
	else if (word == "START_TIME_FIELD"){
		return new vscode.Hover({language:"START_TIME_FIELD",
        value:"START_TIME_FIELD = <field>\n\
default = StartTime\n\
field name where the start time for the event can be found\n\
if the field is absent, default to the time on the parsing machine."})
	}
	else if (word == "END_TIME_HANDLING"){
		return new vscode.Hover({language:"END_TIME_HANDLING",
        value:"END_TIME_HANDLING = <GIVEN|ROUND|CONSTANT>\n\
default = GIVEN\n\
if GIVEN, ignore DEFAULT_END_TIME, end time defaults to start time\n\
if ROUND, round start down and end up using DEFAULT_END_TIME as the rounding increment in milliseconds, end time defaults to start time\n\
if DURATION, treat DEFAULT_END_TIME as a time increment in milliseconds, add to start time to get the default end time; if missing, end time defaults to start time\n\
if CONSTANT, treat DEFAULT_END_TIME as a POSIX timestamp, add to start time to get the default end time; if missing, end default to start\n\
ROUND and DURATION can also be set to the strings MINUTE, HOUR, DAY, and WEEK, which will result in the appropriate number of milliseconds being used."})
	}
	else if (word == "END_TIME_FIELD"){
		return new vscode.Hover({language:"END_TIME_FIELD",
        value:"END_TIME_FIELD = <field>\n\
default = EndTime\n\
field name where the end time for the event can be found\n\
if the field is absent, use DURATION to determine how to set end time"})
	}
	else if (word == "DEFAULT_END_TIME"){
		return new vscode.Hover({language:"DEFAULT_END_TIME",
        value:"DEFAULT_END_TIME = <time>\n\
default = none\n\
value is used in various ways depending on the END_TIME setting"})
	}
	else if (word == "TIME_PARSER"){
		return new vscode.Hover({language:"TIME_PARSER",
        value:"TIME_PARSER = <time format 1>, <time format 2> ...\n\
		default = None\n\
		The time formats are specified as in Java DateTimeFormatter. If a format contains a comma, enclose it in double quotes. There are some special additional cases:\n\
X1 treats the time as if it’s in epoch seconds.\n\
X1000 treats the time as if it’s in epoch milliseconds.\n\
The formats will be tried in the order they are specified until one of them succeeds.\n\
START_TIME_FIELD and END_TIME_FIELD use this parser when an actual field is specified for a timestamp."})
	}
	else if (word == "TIMEZONE"){
		return new vscode.Hover({language:"TIMEZONE",
        value:"TIMEZONE = <string>\n\
		default = none\n\
		\n\
[Note = this description needs to be synced with the code. It may not be correct.]\n\
time zones are described either using the IANA time zone database names,\n\
using ISO-8601 style, as in ‘+07:00’,\n\
or one of the following = ‘local’, ‘utc’, ‘UTC’."})
	}
	else if (word == "TRANSFORM_IF"){
		return new vscode.Hover({language:"TRANSFORM_IF",
        value:"TRANSFORM_IF:<field_name>:<regex> = <transform_stanza_name>\n\
If the given field matches the regex supplied, the given transform is done using <field_name> as the new log entry."})
	}
	else if (word == "TRANSFORM_IF_PRESENT"){
		return new vscode.Hover({language:"TRANSFORM_IF_PRESENT",
        value:"TRANSFORM_IF_PRESENT:<field_name> = <transform_stanza_name>\n\
If a field exists call the transform_stanza_name on the event"})
	}
	else if (word == "TRANSFORM_FIELD_IF_PRESENT"){
		return new vscode.Hover({language:"TRANSFORM_FIELD_IF_PRESENT",
        value:"TRANSFORM_FIELD_IF_PRESENT:<field_name> = <transform_stanza_name>\n\
If the field exists call the transform_stanza_name, using <field_name> as the new log entry."})
	}

	else if (word == "TRANSFORM"){
		return new vscode.Hover({language:"TRANSFORM",
        value:"TRANSFORM:<field_name> = <transform_stanza_name>\n\
Apply the transform to the specified field.\n\
<field_name> defaults to _$logEntry\n\
“r|” syntax can be used here."})
	}	
	
	else if (word == "TRANSFORM_ALL"){
		return new vscode.Hover({language:"TRANSFORM_ALL",
value:"TRANSFORM_ALL:<field_name> = <transform_stanza_name>,<regex>\n\
Apply further transformation to all matches returned by applying a regular expression to an individual field or to the entire event.\n\
the current target is set to field."})
	}
	else if (word == "TRANSFORM_CASCADE"){
		return new vscode.Hover({language:"TRANSFORM_CASCADE",
        value:"TRANSFORM_CASCADE:<field_name> = <transform name 1>,<transform name 2>,..\n\
Iterates through each transform and applies them to the specified field until one of them successfully parses or it runs out of transforms to apply.\n\
<field_name> defaults to _$logEntry\n\
\n\
If the default field is used the colon delimiter is not necessary.  The syntax is then\n\
\n\
TRANSFORM_CASCADE = <transform>,<transform>,.."})
	}
	else if (word == "VARIABLE_TRANSFORM_INDEX"){
		return new vscode.Hover({language:"VARIABLE_TRANSFORM_INDEX",
        value:"VARIABLE_TRANSFORM_INDEX:<field-to-parse_name> = <int>, <int>, …\n\
		Selects which transform from a variable transform group to apply based on the value(s) of the specified field(s) known as index field(s). Applicable to FORMAT = CSV only.	\n\
		\n\
		<field-to-parse_name> defaults to _$logEntry.\n\
		\n\
		<int>, <int> … specify the list of field indices (with zero being the first field) used to select fields. The values of those fields are concatenated using \"-\" as the separator; then the result is used to find the correct VARIABLE_TRANSFORM by its <type value>. The transform is applied then to the field-to-parse. That completes the execution of the transform group.\n\
		VARIABLE_TRANSFORM_INDEX:<field-to-parse_name> = <field_name1>, <field_name 2> …\n\
		Selects which transform from a variable transform group to apply based on the value(s) of the specified field(s) known as index field(s).\n\
		\n\
		<field-to-parse_name> defaults to _$logEntry.\n\
		\n\
		<field_name 1>, <field_name 2> … specify the list of fields whose values are used to choose which variable transform to execute. The values are concatenated using \"-\" as the separator; then the result is used to find the correct VARIABLE_TRANSFORM by its <type value>. That transform is applied then to the field-to-parse. That completes the execution of the transform group."})
	}
	else if (word == "VARIABLE_TRANSFORM"){
		return new vscode.Hover({language:"VARIABLE_TRANSFORM",
        value:"VARIABLE_TRANSFORM:<type value> = <transform name>\n\
Defines one of the transforms to select from in a variable transform group. This clause always follows a VARIABLE_TRANSFORM_INDEX clause or another VARIABLE_TRANSFORM. \n\
\n\
If a VARIABLE_TRANSFORM is selected (see VARIABLE_TRANSFORM_INDEX for details), it is applied to the passed value. \n\
\n\
<type value> is a string with 2 special values: default and none. By default, <type value> is ‘none’ (no pun intended).\n\
\n\
Special cases:\n\
\n\
If <type value> is ‘default’, the associated transform is applied if no other VARIABLE_TRANSFORM clause’s <type value> matches the indexed field’s value.\n\
\n\
The VARIABLE_TRANSFORM with <type value> of ‘none’ is applied if the index field does not exist or has an undefined value.\n\
\n\
Using the ‘default’ transform and the ‘none’ transform together without any other VARIABLE_TRANSFORM clauses is a common way to perform an action based on whether a field exists."})
	}
	else if (word == "DROP"){
		return new vscode.Hover({language:"DROP",
        value:"	DROP = <true|false|empty|regex>\n\
DROP:<field_name> = <true|false|empty|regex>\n\
default = true\n\
Possible values, and their meaning\n\
true - always drop\n\
false - never drop\n\
empty - drop if the field has no value\n\
regex - drop if the field’s value matches\n\
The regex for the field value here does not use the r| syntax.\n\
If we decide to drop then the action taken depends on the whether field_name is specified.\n\
With no field name argument, drop this event - do not record it in the database.\n\
With a field name argument, just delete that field from the event. This is useful to get rid of temporary fields that may collide with later uses, or to prevent a temporary field (the field that starts with _$) from getting prefixed by FIELD_PREFIX and added to the event because it no longer has an underscore at the front.\n\
“r|” syntax can be used here for the field_name. eg. DROP:r|^blah.* = true will drop all fields in the event starting with blah."})
	}
	else if (word == "CLEAR"){
		return new vscode.Hover({language:"CLEAR",
        value:"CLEAR:<field_name> = <regex>\n\
default = none\n\
<field_name> is required\n\
clears field value if regex matches."})
	}
	else if (word == "RENAME_FIEL"){
		return new vscode.Hover({language:"RENAME_FIEL",
        value:"RENAME_FIELD:<new_field_name> = <old_field_name>\n\
default = none\n\
<old_field_name> and <new_field_name> are required\n\
Renames the field named the value of old_field_name to the value of new_field_name.\n\
Note if the value of <old_field_name> is None, it will NOT copy the value into <new_field_name> but it will still remove <old_field_name>."})
	}

	else if (word == "COPY_FIELD"){
		return new vscode.Hover({language:"COPY_FIELD",
        value:"COPY_FIELD:<target_field_name> = <source_field_name>\n\
default = none\n\
<source_field_name> and <target_field_name> are required\n\
Copies the value of the field named the value of source_field_name to the field named the value of target_field_name."})
	}

	else if (word == "FIELD_PREFIX"){
		return new vscode.Hover({language:"FIELD_PREFIX",
        value:"FIELD_PREFIX = <mustache template>\n\
default = none\n\
prefix all field names added by subtransforms of this transform on fields with a string computed from the\n\
given mustache template - the template is supplied the list of field names and values. For example, Response_{{_match_count}} would set the field named Response_0 if the _match_count field was set to 0."})
	}

	else if (word == "FIELD_SUFFIX"){
		return new vscode.Hover({language:"FIELD_SUFFIX",
        value:"FIELD_SUFFIX = <mustache template>\n\
default = none\n\
Suffix all field names added by subtransforms of this transform on fields with a string computed from the given mustache template - the template is supplied the list of field names and values. For example, Response_{{_match_count}} would set the field named Response_0 if the _match_count field was set to 0."})
	}

	else if (word == "ITER_PREFIX"){
		return new vscode.Hover({language:"ITER_PREFIX",
        value:"ITER_PREFIX = <mustache template>\n\
default = none\n\
Same as FIELD_PREFIX, bus specifically applied for REPEAT_MATCH regex transforms. _match_count is set to the current iteration in this case."})
	}

	else if (word == "ITER_SUFFIX"){
		return new vscode.Hover({language:"ITER_SUFFIX",
        value:"ITER_SUFFIX = <mustache template> \n\
default = none\n\
Same as FIELD_SUFFIX, bus specifically applied for REPEAT_MATCH regex transforms. _match_count is set to the current iteration in this case."})
	}

	else if (word == "ADD_VALUES"){
		return new vscode.Hover({language:"ADD_VALUES",
        value:"ADD_VALUES = <true|false>\n\
default = false\n\
if true, when parsing produces a value for the same field more than once,\n\
append the second and subsequent values to the field\n\
if false, replace the value of the field\n\
Note: this attribute works only on [sourcetype] stanza level."})
	}

	else if (word == "JOIN_LIST"){
		return new vscode.Hover({language:"JOIN_LIST",
        value:"JOIN_LIST:<field_name> = <separator>\n\
default = _$logEntry\n\
Joins a list created by ADD_VALUES with the separator mentioned. If the field doesn’t exist, the event is treated as unparsed.\n\
“r|” syntax can be used here."})
	}

	else if (word == "SPLIT_LIST_AT_ELEMENT"){
		return new vscode.Hover({language:"SPLIT_LIST_AT_ELEMENT",
        value:"SPLIT_LIST_AT_ELEMENT:<field_name> = <index>\n\
Splits a list created by ADD_VALUES in the <field_name> field at the specified index under the name <field_name>_2.\n\
If the field is not a list and the index is not 0, or the index is beyond the length of the list, the event is treated as unparsed."})
	}

	else if (word == "REPLACE_LIST_WITH_ELEMENT"){
		return new vscode.Hover({language:"REPLACE_LIST_WITH_ELEMENT",
        value:"REPLACE_LIST_WITH_ELEMENT:<field_name> = <index>\n\
Sets the <field_name> field if it is a list to the <index>th element in that list, starting from 0. If this element does not exist, the event is treated as unparsed."})
	}

	else if (word == "REVERSE_LIST"){
		return new vscode.Hover({language:"REVERSE_LIST",
        value:"REVERSE_LIST:<field_name> = <anything>\n\
reverse a list created by ADD_VALUES in the <field_name> field. The <anything> field is currently ignored. If the field doesn’t exist, the event is treated as unparsed."})
	}

	else if (word == "WRAPPER"){
		return new vscode.Hover({language:"WRAPPER",
        value:"WRAPPER = <Transform name>\n\
Always applied first, before the FORMAT is applied. Applies the transform to the current log entry, then replaces the current log entry with a _$log_entry field created by the transform."})
	}

	else if (word == "EVENT_MULTILINE"){
		return new vscode.Hover({language:"EVENT_MULTILINE",
        value:"EVENT_MULTILINE = true | false\n\
default = false\n\
If true, parsing does not stop at \\n delimiter.\n\
This Attributes is  Specific to REGEX Format."})
	}

	else if (word == "REGEX"){
		return new vscode.Hover({language:"REGEX",
        value:"REGEX = <regex>\n\
default = none\n\
parses incoming events\n\
capture groups are treated as fields by default\n\
\n\
if groups are named _VAL_<match_name> or _FIELD_<match_name>\n\
then field names and values for those fields can be captured from\n\
the original value\n\
Example:\n\
REGEX = %{{WORD:_FIELD_1}}:%{{HOSTNAME:_VAL_1}}\n\
RAW = Host:factorchain.com\n\
would result in {\"Host\" = \"factorchain.com\"}\n\
This Attributes is  Specific to REGEX Format"
	})
	}

	else if (word == "REPEAT_MATCH"){
		return new vscode.Hover({language:"REPEAT_MATCH",
        value:"REPEAT_MATCH = <true|false>\n\
default = false\n\
after each subsequent match of a regex, continue matching on the remaining field value.\n\
This Attributes is  Specific to REGEX Format"})
	}

	else if (word == "STRIP_FIELDS"){
		return new vscode.Hover({language:"STRIP_FIELDS",
        value:"STRIP_FIELDS = <true|false>\n\
default = true\n\
Strips each field of whitespace from the beginning and the end of the field at parse time.\n\
This Attributes is  Specific to REGEX Format"})
	}

	else if (word == "FIELD_DELIMS"){
return new vscode.Hover({language:"FIELD_DELIMS",
value:"FIELD_DELIMS = <quoted_string>\n\
default = \",\"\n\
default is a comma\n\
Value is a quoted string containing the set of delimiters used between field values in the body of the log.\n\
Use \\ to escape double quote characters.\n\
This Attributes is  Specific to CSV Format"})
	}

	else if (word == "FIELD_HEADER_DELIMS"){
		return new vscode.Hover({language:"FIELD_HEADER_DELIMS",
        value:"FIELD_HEADER_DELIMS = <quoted_string>\n\
Default = \“,\”\n\
Delimiter to split the fields in FIELDS.\n\
This Attributes is  Specific to CSV Format"})
	}

	else if (word == "FIELD_START_INDEX"){
		return new vscode.Hover({language:"FIELD_START_INDEX",
        value:"FIELD_START_INDEX = <integer>\n\
Default = 0\n\
Starting number of CSV elements at which field values are matched to values.\n\
This Attributes is  Specific to CSV Format"})
	}

	else if (word == "FIELD_QUOTE"){
		return new vscode.Hover({language:"FIELD_QUOTE",
        value:"FIELD_QUOTE = <quoted_string>\n\
default = \"\"\"\n\
Specifies the quote characters to use when parsing these lines\n\
Data contained between a pair of FIELD_QUOTES is taken verbatim.\n\
This Attributes is  Specific to CSV Format"})
	}

	else if (word == "FIELD_HEADER_QUOTE"){
		return new vscode.Hover({language:"FIELD_HEADER_QUOTE",
        value:"FIELD_HEADER_QUOTE = <quoted_string>\n\
default = value of FIELD_QUOTE\n\
specifies the quote characters to use when parsing these field names\n\
data contained between a pair of FIELD_QUOTES is taken verbatim.\n\
This Attributes is  Specific to CSV Format"})
	}

	else if (word == "FIELDS"){
		return new vscode.Hover({language:"FIELDS",
        value:"FIELDS = <field_name>, <field_name>, ...\n\
default = none\n\
parsed values are sequentially assigned to these fields\n\
if there are too many values, field name will be index (ie \"8\")\n\
if there are too few, value is set to default or empty string\n\
This Attributes is  Specific to CSV Format"})
	}

	else if (word == "OPTIONAL_FIELDS"){
		return new vscode.Hover({language:"OPTIONAL_FIELDS",
        value:"OPTIONAL_FIELDS = <field_name>, <field_name>, ...\n\
default = none\n\
Once parsed values have been sequentially assigned to all fields mentioned in the FIELDS attribute, they will then be assigned to these optional fields. if there are not enough values to assign to all optional fields, no error will be recorded.\n\
This Attributes is  Specific to CSV Format"})
	}

	else if (word == "ROOT_TAG"){
		return new vscode.Hover({language:"ROOT_TAG",
        value:"ROOT_TAG = <element_name>, <element_name>, ...\n\
default = root\n\
if an element's name is contained in this list then treat it as a root element\n\
if events are being transmitted as a series\n\
This Attributes is  Specific to XML Format"})
	}

	else if (word == "LOG_ENTRY_TAG"){
		return new vscode.Hover({language:"LOG_ENTRY_TAG",
        value:"LOG_ENTRY_TAG:<element_name> = <attribute_name>, <attribute_name>, ...\n\
element_name default = \"event\"\n\
attribute_name default = none\n\
if an element's name is specified then treat it as a log entry element\n\
attributes are treated as field names and attribute values are treated as field values\n\
This Attributes is  Specific to XML Format"})
	}

	else if (word == "DICTIONARY_TAG"){
		return new vscode.Hover({language:"DICTIONARY_TAG",
        value:"DICTIONARY_TAG:<element_name> = <attribute_name>, ...\n\
element_name default = none\n\
attribute_name = none\n\
These elements contain dictionaries of values.\n\
The named attributes are treated as field names and attribute values are treated as field values.\n\
Prepend the element_name to all field names found in the dictionary element.\n\
This Attributes is  Specific to XML Format"})
	}

	else if (word == "FIELD_TAG"){
		return new vscode.Hover({language:"FIELD_TAG",
        value:"FIELD_TAG:<element_name> =  <attribute_name>\n\
element_name = None\n\
attribute_name default = \"name\"\n\
\n\
If the current element’s name matches element_name, store its value in a field whose name is stored in attriute_name on that element.\n\
This Attributes is  Specific to XML Format"})
	}

	else if (word == "JSON_DROP_NULLS"){
		return new vscode.Hover({language:"JSON_DROP_NULLS",
        value:"JSON_DROP_NULLS = <true|false>\n\
default = false\n\
Drops all null values from the JSON.\n\
This Attributes is  Specific to JSON Format"})
	}
}


function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
    if (document) {
        let lines = document.getText().split('\n');
        let diag=[];
        for (let index = 0; index < lines.length; index++) {
            let reg_match_regex = new RegExp(/r\|.+?( |\n|$)/, 'ig');
            //let matches=document.getText().match(reg_match_regex);
            let line=lines[index];
            var match = reg_match_regex.exec(line);
            // matches.forEach(element => {
            //     console.log();
            // });
            while (match) {
                console.log(match);
                
                try {
                    let r=new RegExp(match[0].substring(2));
                }
                catch (exception) {
                    var message = exception.message;
                    diag.push({
                        code: '',
                        message: 'Not a Valid Regex',
                        range: new vscode.Range(new vscode.Position(index, match.index), new vscode.Position(index, match.index+match[0].length)),
                        severity: vscode.DiagnosticSeverity.Error,
                        source: '',
                        relatedInformation: [
                            new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(index+1, match.index), new vscode.Position(index+1, match.index+match[0].length))), message)
                        ]
                    });
                    
                }
                match = reg_match_regex.exec(line);
            }
            collection.set(document.uri, diag);
            for (let index = 0; index < lines.length; index++) {
                const element = lines[index];
            }
        }
    } else {
        collection.clear();
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}