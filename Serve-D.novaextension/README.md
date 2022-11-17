<img src="https://raw.githubusercontent.com/staysail/nova-serve-d/main/rocket.png" align="right" width="100" alt="[Logo]" />

## D-Velop Extension for Nova

**D-Velop** provides deep integration with [**D**][1] via the [Serve-D][2] Language Server.

This includes support for syntax highlighting via a [Tree-sitter][3] D [grammar][4], indentation,
folding, and automatic formatting via `dfmt`, including optional formatting of your
code on save.

If you have installed our _D_ extension, you may disable that as this
extension includes all of that functionality as well.

![](https://raw.githubusercontent.com/staysail/nova-serve-d/main/screenshot.png)

## Requirements

**D-Velop** requires the `serve-d` language server for full functionality.

By default, it will offer to download and use a current version of `serve-d`
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

## Usage

**D-Velop** runs any time you open a local project, automatically lints all open
files, then reports errors and warnings in Nova's **Issues** sidebar
and the editor gutter.

You can use the `Format File` from the editor menu, and you can also enable
this to happen automatically when saving on a per workspace basis by setting
it in the project settings.

### Configuration

At this time the only Project level configuration is enabling the
automatic **Format on Save**. It is anticipated that additional
options will become available soon.

Note that the default formatting does not perfectly match the
settings used by `dfmt` if you use it. This will be made more
flexible in the near future.

## Future Work

There are settings for different types of formatting options that
we plan to add, so projects can adjust their formatting to taste.

More control over the diagnostic hints provided by serve-d would be nice
as well.

Import order sorting will be added soon.

We anticipate that `serve-d` will grow additional capabilities, and when
it does we will try to enable such functionality here.

Support for DUB including selecting build configuration and actually performing builds
is planned as well.

---

## Attribution

The D Rocket logo is used [under license][2].

[1]: https://dlang.org "D Language web site"
[2]: https://github.com/Pure-D/serve-d "Serve-D repository"
[3]: https://tree-sitter.github.io "Tree-sitter web site"
[4]: https://github.com/gdamore/tree-sitter-d "D Grammar for Tree-sitter"
[5]: https://github.com/dlang-community/artwork "D community artwork"
