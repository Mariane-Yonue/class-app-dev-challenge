// Function that splits an string, if the splitElem is outside an ""
function splitString(string, splitElem) {
  var isInsideQuotes = false;
  var newString = "";
  var splittedStringArray = [];


  // Run through the string
  for (var i = 0; i < string.length; i++) {

    // Check if the character is inside double quotes
    if (string.charAt(i) == '\"')
      isInsideQuotes = !isInsideQuotes;

    // if the char is equal to the splitElem and is not in double quotes
    if (string.charAt(i) == splitElem && !isInsideQuotes) {

      // Add created string to array, and reset it
      splittedStringArray.push(newString);
      newString = "";

    // Else, add new char to the string being created
    } else
      newString += string.charAt(i);

  }

  // After the end of the loop, add the rest of the string if no splitElem found
  splittedStringArray.push(newString);


  return splittedStringArray;
}



// Function to extract classes names from string (assuming correct strings)
function getClassesNames(string) {
  var salaSubIndexesStart = [];
  var salaSubIndexesEnd = [];
  var classesNames = [];


  // If the string is undefined, return ""
  if (string == undefined) return "";

  // Getting all "Sala" substrings indexes
  for (var i = 0, j = 0; i < string.length; i++) {
    if (string.slice(i, i + 4) == "Sala") {
      // Getting substring start index
      salaSubIndexesStart.push(i);

      // Getting substring end index
      j = i + 4;
      while (string[j] == " ") j++;
      while(string[j] >= '0' && string[j] <= '9') j++;
      salaSubIndexesEnd.push(j);
    }
  }

  // Getting all Sala substrings
  for (var i = 0; i < salaSubIndexesStart.length; i++) {
      var subStart = salaSubIndexesStart[i];
      var subEnd = salaSubIndexesEnd[i];

      classesNames.push(string.slice(subStart, subEnd));
  }


  return classesNames;
}



// Function to extract types from header's strings
function getAddressesType(header) {
  var type = "";

  // Starting at i = 1 to ignore " character of 'email' info
  if (header[0] == '\"') {
    for (var i = 1; i < header.length && header[i] != ' '; i++)
        type += header[i];

  // Starting at i = 0 when 'phone' info
  } else {
    for (var i = 0; i < header.length && header[i] != ' '; i++)
        type += header[i];
  }

  return type;
}



// Function to extract tags from header's strings
function getAddressTags(header) {
  var tags;

  if (header[0] == '\"')
    tags = splitString(header.slice(7, header.length - 1), ',');
  else
    tags = header.slice(6, header.length);

  return tags;


}


// Function to make a simple validation of e-mails
function simpleEmailValidation(emailAddress) {

}


// Function to make a simple validation and correction of phonenumbers
function simplePhoneValidation(phoneNumber) {

}



// Object User to instantiate a JSON object
class User {
  constructor(fullname, eid, classes, addresses, invisible, see_all) {
    this.fullname = fullname;
    this.eid = eid;
    this.classes = classes;
    this.addresses = addresses;
    this.invisible = invisible;
    this.see_all = see_all;
  }

}



// Object Address to instantiate a JSON object address into User's addresses list
class Address {
  constructor(type, tags, address) {
    this.type = type;
    this.tags = tags;
    this.address = address;
  }
}



/* ------------------------------- MAIN ------------------------------------- */
fs = require("fs");

// Reading file
fs.readFile('input.csv', 'utf8', function (err, data) {
  if (err) throw err;


  // Turning it into an array
  var fileLines = data.split('\n');
  var csvHeaders = splitString(fileLines[0], ',');


  // Creating a JSON variable
  var jsonObj = {};
  var jsonData = [];



   // Variables to use in creating new JSON instances
   var fullname;
   var eid;
   var classes;
   var addresses;
   var invisible;
   var see_all;


   // Variables used in the loop to control flow
   var isUserInArray = false;
   var thisLine;




  // Loop that runs through the data rows starting from first actual element row
  for (var i = 1; i < fileLines.length; i++) {
    var equalElementIndex;
    thisLine = splitString(fileLines[i], ',');
    isUserInArray = false;

    // Initializing values of the User
    fullname = thisLine[0];
    eid = thisLine[1];
    classesNames = getClassesNames(thisLine[2]).concat(getClassesNames(thisLine[3]));

    // Getting addresses info
    address = [];
    for (var j = 4; j < 9; j++) {
      if (thisLine[j] != undefined)
        address.push(new Address(getAddressesType(csvHeaders[j]), getAddressTags(csvHeaders[j]), thisLine[j]));
    }

    invisible = (thisLine[10] == "1") ? true : ((thisLine[10] == "0") ? false : "");
    see_all = (thisLine[11] == "yes") ? true : ((thisLine[11] == "no") ? false : "");


    // Check if there is an equal eid on list
    for (j = 0; j < jsonData.length && !isUserInArray; j++) {
      if (jsonData[j].eid == eid) {
        isUserInArray = true;
        equalElementIndex = j;
      }
    }


    // If there is this user in the JSON array, update it
    if (isUserInArray) {

      // Updating 'invisible' info
      if (jsonData[equalElementIndex].invisible == "" && invisible != "")
        jsonData[equalElementIndex].invisible = invisible;

      // Updating 'see_all' info
      if (jsonData[equalElementIndex].see_all == "" && see_all != "")
        jsonData[equalElementIndex].see_all = see_all;

      // Updating 'classes' info
      if (classesNames != [])
        jsonData[equalElementIndex].classes = jsonData[equalElementIndex].classes.concat(classesNames);

      // Updating 'addresses' info


    // Else, create new user in array
    } else
      jsonData.push(new User(fullname, eid, classesNames, address, invisible, see_all));

  }


  jsonData = JSON.stringify(jsonData);


  // Creating a JSON file
  fs.writeFile("output.json", jsonData, function(error) {
    if (error) {
      console.log("Could not create and write JSON info to a file.");
      throw error;
    }

  });
});
