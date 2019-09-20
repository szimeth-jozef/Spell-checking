// readTextFile("file:///C:\Users\szimeth\Desktop\GitHub\Spell-checking\src\hunspell-sk-20110228\sk_SK.txt");

function load() {
    let someData_notJSON = JSON.parse("sk_SK.json");
    console.log(someData_notJSON.words);
    console.log("func run");
}

load();