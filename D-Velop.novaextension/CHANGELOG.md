## Version 0.8.5

Bitfield support added for tree-sitter. (New in D2.101).

Marked deprecated forms of version and debug constructs using integers as
"invalid". (Technically still valid, but deprecated in D2.101, and not
advised.)

Symbolication of constructor, destructor, and postblits.

Member fields are marked as properties rather than variables.

Other minor tree-sitter query fixes.

## Version 0.8.4

Added switch alignment configuration for formatting.

Added ability to configure project import paths.

Added ability to configure DMD path used by _serve-d_.

Added Sort Imports commands. This only sorts the import block
where the cursor or selection is located. This is a limitation in _serve-d_.

## Version 0.8.3

Added configuration support for formatting. This requires _serve-d_ 0.8.0-beta.9
or better.

Dub recipes are now generated from _serve-d_.

Nicer DUB logo that adapts to themes (especially dark mode).

Fixed a bug where the "Format On Save" configuration was not respected.

## Version 0.8.2

Fix for non-functional format command.

Added support for local symbol renaming (requires _serve-d_ 0.8.0-beta.8 or better).

Note that due to the usual problem with Nova symbols (selections) starting in
columns 0 or 1, or rows 0 or 1, won't work. (Nova issues those as "true" and
"false" in range selections.)

## Version 0.8.1

Introduce special tasks for Weka.io staff (local compilation, testing).

More resilient issue matchers from compiler output.

Fixes for server restart (hopefully) to make it less brittle.

## Version 0.8.0

Introduce very limited support for DUB. (Will expand.)

Introduce symbolication (which helps the editor understand nesting
levels, and such. The symbols sidebar know provides useful data, and
completions will include some guidance about what is being completed.)

## Version 0.7.1

Bug fixes for download process.

## Version 0.7

Renamed to D-Velop.

Major refactoring of internal code.

Implemented support for checking/downloading serve-d from GitHub.

Access to preferences and server restart from GUI.

## Version 0.6

Various bug fixes.

## Version 0.5

Initial preview release
