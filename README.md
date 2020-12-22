# Spell-checking

Google chrome extension.
This Spell checker extension supports dictionaries formated for Hunspell and Aspell programs.
In current version is Slovak dictionary. But you can change the languege by replacing dictionary files, .dic and .aff.


Workflow:
1. Load DOM
2. Filter TextNodes
3. Create VirtualElements form TextNodes
    1. Split TextNode string to words
    2. Clear words
    2,5. TODO: Insert here a queue, which will feed the worker thread with words one by one and will wait till the worker has ended his task
    3. Send them to compare (check the word)
    4. We get back the word with results and the we're calling wrapWord on them
