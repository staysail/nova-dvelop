## Version 0.9.6

With the release of Nova 10.4, the problem with serialization of 1 and 0
in the LSP client is gone, and the associated workarounds and limits are
removed. It is recommended to upgrade to Nova 10.4 or better.

## Version 0.9.5

Finer grained highlighting for keywords.

Enumeration members symbolicated correctly.

Server debugging enabled conditionally via configuration.

## Version 0.9.4

Another fix for an update regression. Are we loving JavaScript yet? (not!)

## Version 0.9.3

Fix for accidental regression which broke most of the extension.

## Version 0.9.2

Minor bug fixes observed while porting this to **C-Dragon**. It's
unlikely that anyone has been impacted by these bugs (mostly errors
in error branches), but let's fix them!

## Version 0.9.1

Added funding link (sponsorship button).

## Version 0.9.0

Fix for update (again). Thanks to Paul Winder for the suggested fix.

Fix for Format On Save.

Several formatting settings would not apply without an extension restart.
This is now fixed.

New ability to disable the language server. If this is checked, then this
becomes a "dumb" extension, which provides Syntax highlighting, indentation,
and symbolication only. Formatting, some navigation, and symbol renaming,
and import sorting will all not operate without a language server.

If the language server is disabled, then this extension will also never
attempt to access the network or run any external processes, with the exception
that some limited build recipes may remain available.

Extension Preferences command renamed to **Extension Preferences** to help
disambiguate it from the project-local **Preferences** command.

When using a custom server, the "default" server is chosen in a way that
will work better for folks using homebrew.

## Version 0.8.6

Bug fixes only (for download and restart).

## Version 0.8.5

Bitfield support added for tree-sitter. (New in D2.101).

Marked deprecated forms of version and debug constructs using integers as
"invalid". (Technically still valid, but deprecated in D2.101, and not
advised.)

Symbolication of constructor, destructor, and postblits.

Member fields are marked as properties rather than variables.

Other minor tree-sitter query fixes.

Internal refactoring to make code cleaner, and restarts more reliable
(hopefully).

Configuration support for "manyProjects" (so you can silence those
notifications for projects) -- project preference level only at the moment.

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
