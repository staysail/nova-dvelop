<img src="https://raw.githubusercontent.com/staysail/nova-serve-d/main/Serve-D.novaextension/extension.png" align="right" width="100" alt="[Logo]" />

## Serve-D Extension for Nova

**Serve-D** provides deep integration with [**D**][1] via the [Serve-D][2] Language Server.

This includes support for syntax highlighting via a [Tree-sitter][3] D [grammar][4], indentation,
and folding.  If you have installed our _D_ extension, you may disable that as this
extension includes all of that functionality as well.

![](https://raw.githubusercontent.com/staysail/nova-serve-d/main/screenshot.png)

## Requirements

Serve-D requires the actual `serve-d` language server to be installed on your mac.
Most often this will be located in `/usr/local/bin`, which is the default.


As of this release, it is required to update to a current nightly build,
or to build the server yourself.  In particular, releases **0.7.4** and earlier
will *not* work with this extension.  (Hopefully a new version will be
released soon, and we can update this message here.)

## Usage

Serve-D runs any time you open a local project, automatically lints all open
files, then reports errors and warnings in Nova's **Issues** sidebar
and the editor gutter.

### Configuration

To use a language server at a different path, you can choose the
**Extensions → Extension Library...** menu option, then select the
Serve-D preferences.  The `Language Server Path` is the full
path to the server.

## Future Work

Automatic formatting, including additional configuration using either
the built-in `dfmt` or the `sdfmt` utility is expected.

There are settings for different types of formatting options that
we plan to add, so projects can adjust their formatting to taste.

More control over the diagnostic hints provided by serve-d would be nice
as well.

Once future releases of serve-d are updated, perhaps we can include
the ability to download a working binary automatically.

---

## Attribution

The D Rocket logo is used [under license][2].

[1]: https://dlang.org "D Language web site"
[2]: https://github.com/Pure-D/serve-d "Serve-D repository"
[3]: https://tree-sitter.github.io "Tree-sitter web site"
[4]: https://github.com/gdamore/tree-sitter-d "D Grammar for Tree-sitter"
[5]: https://github.com/dlang-community/artwork "D community artwork"