# Serve-D Exension for Nova

**Serve-D** provides deep integration with [**D**][1] via the [Serve-D][2] Language Server.

This includes support for syntax highlighting via a [Tree-sitter][3] D [grammar][4], indentation,
and folding.  If you have installed our _D_ extension, you may disable that as this
extension includes all of that functionality as well.


![](https://nova.app/images/en/dark/editor.png)

## Requirements

Serve-D requires the actual `serve-d` language server to be installed
on your Mac.  Most often this will be located in `/usr/local/bin`.

As of this release, it is required to update to a current nightly build,
or to build the server yourself.  In particular, releases **0.7.4** and earlier
will *not* work with this extension.  (Hopefully a new version will be
released soon, and we can update this message here.)


## Usage

<!--
🎈 If your extension provides features that are invoked manually, consider describing those options for users:
-->

To run Serve-D:

- Select the **Editor → Serve-D** menu item; or
- Open the command palette and type `Serve-D`

<!--
🎈 Alternatively, if your extension runs automatically (as in the case of a validator), consider showing users what they can expect to see:
-->

Serve-D runs any time you open a local project, automatically lints all open files, then reports errors and warnings in Nova's **Issues** sidebar and the editor gutter.

### Configuration

<!--
🎈 If your extension offers global- or workspace-scoped preferences, consider pointing users toward those settings. For example:
-->

To configure global preferences, open **Extensions → Extension Library...** then select Serve-D's **Preferences** tab.

You can also configure preferences on a per-project basis in **Project → Project Settings...**

---

## Attribution

The D Rocket logo is used [under license][2].

[1]: https://dlang.org "D Language web site"
[2]: https://github.com/Pure-D/serve-d "Serve-D repository"
[3]: https://tree-sitter.github.io "Tree-sitter web site"
[4]: https://github.com/gdamore/tree-sitter-d "D Grammar for Tree-sitter"
[5]: https://github.com/dlang-community/artwork "D community artwork"