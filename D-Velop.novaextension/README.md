<img src="https://raw.githubusercontent.com/staysail/nova-serve-d/main/rocket.png" align="right" width="100" alt="[Logo]" />

## D-Velop Extension for Nova

> This extension is a _BETA_ release.

**D-Velop** provides deep integration with [**D**][1] via the [Serve-D][2] Language Server, as well as a [Tree-sitter][3] D [grammar][4].

## ✨ Features ✨

- Syntax highlighting
- Indentation (automatic, somewhat limited)
- Symbols
- Folding
- Format File (including On Save) or Selection
- Rename Symbol (local to file only)
- Jump To Definition
- Build Tasks
- Issue Parsing (from DUB or DMD output)
- Sort Imports
- Signature Assistance
- Code Quality Hints
- Support for D 2.101

## 📸 Screenshots 📸

![](https://raw.githubusercontent.com/staysail/nova-serve-d/main/screenshot1.png)
![](https://raw.githubusercontent.com/staysail/nova-serve-d/main/screenshot2.png)
![](https://raw.githubusercontent.com/staysail/nova-serve-d/main/screenshot3.png)
![](https://raw.githubusercontent.com/staysail/nova-serve-d/main/screenshot4.png)

## ⚙️ Language Server Integration ⚙️

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

## 🛡️ Security Considerations 🛡️

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

You may also disable the use of the language server entirely, which
can be done globally, but maybe overridden on a per project basis.
Of course, if you do this, you will lose access to a significant portion of
the functionality that **D-Velop** can provide, although a fair amount
of useful functionality will remain.

## 🔮 Future Directions 🔮

More control over the diagnostic hints provided by _serve-d_ would be nice as well.

Richer support for configuration of `dub` recipes and settings, such as
selecting different configurations, is planned.

Import order sorting works now, but is somewhat limited. We would like to
see this tied into the formatting as an option when formatting documents.

We anticipate that _serve-d_ will grow additional capabilities, and when
it does we will try to enable such functionality here.

## 🐜 Bugs 🐜

> Note that earlier versions of Nova had bugs which impacted the functionality
> of this extension. It is recommended to update to Nova 10.4 or better.

- Symbol renames can mess up highlighting. Make a subsequent change to refresh the
  tree-sitter grammar's view of things. This appears to be a Nova defect.

- _serve-d_ only supports renaming local symbols (including function parameters).
  We hope someday this will improve, and when it does this extension should just
  automatically benefit.

- Sometimes, _serve-d_ may not restart correctly. This usually happens when
  changing one of the few options which require a server restart. If this
  happens, try using the **Restart Server** command from the Command Palette,
  or just disable and re-enable the extension.

---

## ⚖️ Attribution ⚖️

The D Rocket logo is used [under license][2].

[1]: https://dlang.org "D Language web site"
[2]: https://github.com/Pure-D/serve-d "Serve-D repository"
[3]: https://tree-sitter.github.io "Tree-sitter web site"
[4]: https://github.com/gdamore/tree-sitter-d "D Grammar for Tree-sitter"
[5]: https://github.com/dlang-community/artwork "D community artwork"
[6]: https://devforum.nova.app/t/lsp-integers-0-and-1-serialized-to-boolean/1831
