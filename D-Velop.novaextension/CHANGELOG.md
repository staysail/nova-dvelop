## Version 1.0.3

Bumps Tree-Sitter grammar to 0.4.0.  This includes minor changes for
queries.

## Version 1.0.2

Better support for unit testing (assertions will be issues).

Find References pane now shows content preview even for files not open.

Debugging of this extension is off by default (should help performance).

## Version 1.0.1

Fix highlighting of some type aliases (e.g. "string", "ptrdiff_t") when they
appear in imports or other contexts that are not a type.

Tweak the highlighting for import package names to use a the @processing
selector, which is a little less jarring in most themes than @cdata.

## Version 1.0.0

Enable -unittest for Weka repository users.
Formalize for a non-beta release.

## Version 0.9.16

Trivial description change to make finding us (searching for dlang) easier.
There are no functional changes in this release.

## Version 0.9.15

Better highlighting for string, ptrdiff_t, etc.

## Version 0.9.14

Fix regression in symbolication query (from 0.9.13).

## Version 0.9.13

Find references no longer opens files that are not already open.
This eliminates the very long stalls when looking for a symbol that appears
widely, especially in the standard library, such as toString.  As a result
we do not provide a preview of those cases in the sidebar, instead just
showing ellipses.

Numerous improvements to syntax highlighting.

## Version 0.9.12

Added support for Find References. This depends on new functionality
in serve-d itself, and is experimental. The functionality in serve-d
is anticipated to be in the release after 0.8.11.

Note that occasionally serve-d may crash when running this -- due to
bugs in serve-d which we anticipate will be fixed over time. Likewise,
the accuracy of these references is somewhat limited as the current
implementation in serve-d is somewhat naive - so for example references
in mixins or certain other constructs won't necessarily be picked up.

We expect this to improve over time, as serve-d becomes more sophisticated.

## Version 0.9.11

Improved indentation.

## Version 0.9.10

Highlighting fix. In some circumstances attributes were highlighted
inconsistently or incorrectly.

## Version 0.9.9

It is possible to change the compiler used for DUB recipes, as well
as other settings like the architecture and build type now. Note that
explicitly changing the architecture may or may not work depending on
your compiler. For best results we recommend using ldc2.

Initialization handling was not quite right due to a source code management
snafu. Additionally, we now properly report when the LSP is disabled.

The old DMD path configuration setting didn't actually do anything useful,
unless you needed to compile DCD, which should never happen now. We have
removed it.

## Version 0.9.8

New initialization handling. This should be _far_ more robust than previous
versions. It requires `serve-d` 0.8.0 beta 10 or better, which also includes
important fixes for stability of the language server.

New sidebar information pane with details about the language server, and the
ability to restart it.

## Version 0.9.7

Find Symbol support and the new sidebar.

Button fix for rename.

## Version 0.9.6

Format Selection.

Menu access to extension preferences and restart server.

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
