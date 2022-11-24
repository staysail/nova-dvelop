##
## Makefile for Nova Serve-D  extension.
## This builds the tree-sitter dynamic library
## and moves over queries we need.
##

PARSER		= d
EXT_DIR		= D-Velop.novaextension
SYNTAX_DIR	= $(EXT_DIR)/Syntaxes
QUERY_DIR	= $(EXT_DIR)/Queries
TS_DIR		= tree-sitter-d
SRC_DIR		= tree-sitter-d/src
APPBUNDLE	= /Applications/Nova.app
FRAMEWORKS	= "${APPBUNDLE}/Contents/Frameworks/"
CODESIGN	= codesign
LIBNAME		= libtree-sitter-$(PARSER).dylib
SRCS		= $(SRC_DIR)/parser.c $(SRC_DIR)/scanner.c
QUERIES		= $(QUERY_DIR)/highlights.scm $(QUERY_DIR)/folds.scm
CP			= cp

# install directory layout
PREFIX ?= /usr/local
LIBDIR ?= $(PREFIX)/lib

DYLIB = $(SYNTAX_DIR)/$(LIBNAME)

OSXFLAGS = -arch arm64 -arch x86_64 -mmacosx-version-min=11.6

CFLAGS = -O3 -Wall -Wextra -Wno-unused -Wno-unused-parameter -I$(SRC_DIR) -std=gnu99 -fPIC

LINKSHARED := $(LINKSHARED)-dynamiclib -Wl,
LINKSHARED := $(LINKSHARED)-install_name,/lib/$(LIBNAME),-rpath,@executable_path/../Frameworks

LDFLAGS=-F${FRAMEWORKS} -framework SyntaxKit -rpath @loader_path/../Frameworks

all: $(DYLIB) $(QUERIES)

$(DYLIB): $(SRCS)
	$(CC) $(OSXFLAGS) $(CFLAGS) $(LDFLAGS) $(LINKSHARED) $^ $(LDLIBS) -o $@
	$(CODESIGN) -s - $@

$(QUERY_DIR)/%.scm: $(TS_DIR)/queries/nova-%.scm
	$(CP) $< $@

clean:
	rm -f $(OBJ) libtree-sitter-$(PARSER_NAME).dylib
	rm -rf build/

clobber:
	rm -f $(DYLIB) $(QUERIES)

.PHONY: all install clean
