<img src="https://raw.githubusercontent.com/staysail/nova-serve-d/main/rocket.png" align="right" width="100" alt="[Logo]" />

## D-Velop Extension for Nova

> This extension is a _BETA_ release.

**D-Velop** provides deep integration with [**D**][1] via the [Serve-D][2] Language Server.

This includes support for syntax highlighting via a [Tree-sitter][3] D [grammar][4], indentation,
folding, and automatic formatting via `dfmt`, including optional formatting of your
code on save.

Also, some support for symbolication (the **Symbols** sidebar in Nova, and symbol type icons),
along with local symbol renaming support is provided.

If you have installed our _D_ extension, you may disable that as this
extension includes all of that functionality as well.

> _NOTE_: An earlier version extension of this was named _Serve-D_.

![](https://raw.githubusercontent.com/staysail/nova-serve-d/main/screenshot.png)

## Requirements

**D-Velop** requires the _serve-d_ language server for full functionality.

By default, it will offer to download and use a current version of _serve-d_
from the official GitHub releases for that project. It will also check
for a newer version when you first start the editor. Additionally you can
check for a newer version manually by using the **Extensions → D-Velop → Check for Update**
menu selection.

If you prefer to use a copy installed locally, you can select a path to
`serve-d` in the Preferences for the extension. Make sure to mark the
**Custom Serve-D Installation** option and configure the path properly.

You can disable automatic updates if you prefer. Also, you can live a little
more on the edge by checking the **Use Beta Releases** option.
(Note that at this time **D-Velop** will automatically select the the most
recent 0.8.0 beta release, as that is required to function, until 0.8.0
or newer is released.)

Note that if you use a custom release, you must use a **0.8.0-beta.1** or
newer. Older releases will not function at all with this extension.

Local symbol renaming requires _serve-d_ **0.8.0-beta.8** or newer.

Format customization requires _serve-d_ **0.8.0-beta.9** or newer.

## Usage

**D-Velop** runs any time you open a local project, automatically lints all open
files, then reports errors and warnings in Nova's **Issues** sidebar
and the editor gutter.

You can use the **Format File** option from the editor menu, and you can also enable
this to happen automatically when saving on a per workspace basis by setting
it in the project settings.

### Configuration

At this time the only Project level configuration is enabling the
automatic **Format on Save**. A number of other options are present
in the project specific preferences. (We plan to add support for global
configuration as well, in a future update.)

Note that the default formatting does not perfectly match the
settings used by `dfmt` if you use it. You may wish to adjust.
You can also configure the extension to honor any `.editorconfig` file
if present -- this is actually recommended if you share a workspace
amongst multiple people, especially if they use different editors.

## Security Considerations

You may notice that this extension needs entitlements to access
the network and to read and write local files. These are used
solely to support updating the language server. No files outside
of the extension's private area are accessed directly, and the
only requests made are read-only unauthenticated requests to access
the public release information and actually download the binary
needed for _serve-d_.

If you are concerned, you may download and configure your own
copy of _serve-d_, and disable the automatic downloads. This
will prevent both direct access to the network by this extension,
as well as direct filesystem access. Note however that _serve-d_
may itself perform those activities.

## Future Work

More control over the diagnostic hints provided by _serve-d_ would be nice as well.

Richer support for configuration of `dub` recipes and settings, such as
selecting different configurations, is planned.

Import order sorting works now, but is somewhat limited. We would like to
see this tied into the formatting as an option when formatting documents.

We anticipate that _serve-d_ will grow additional capabilities, and when
it does we will try to enable such functionality here.

A number of other knobs, such as configuration of default behavior when
many subprojects are present, will be supported.

## Bugs

- Symbol renames won't work if the selection starts in columns 0 or 1, or is located
  on the first two lines of the file. This is a [defect][6] in Nova.
  The appearance will be as though nothing has occurred when trying to rename the symbol.

  To workaround this, try just clicking (not selecting) a position within the symbol,
  but in in columns 3 or higher, then rename (the command palette may be easier to use).

- Symbol renames can mess up highlighting. Make a subsequent change to refresh the
  tree-sitter grammar's view of things. This appears to be a Nova defect.

- _serve-d_ only supports renaming local symbols (including function parameters).
  We hope someday this will improve, and when it does this extension should just
  automatically benefit.

---

## Attribution

The D Rocket logo is used [under license][2].

[1]: https://dlang.org "D Language web site"
[2]: https://github.com/Pure-D/serve-d "Serve-D repository"
[3]: https://tree-sitter.github.io "Tree-sitter web site"
[4]: https://github.com/gdamore/tree-sitter-d "D Grammar for Tree-sitter"
[5]: https://github.com/dlang-community/artwork "D community artwork"
[6]: https://devforum.nova.app/t/lsp-integers-0-and-1-serialized-to-boolean/1831
