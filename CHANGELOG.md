# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.18.0] - 2016-12-23
### Added
- JS Standard on a precommit hook to enforce an order everywhere
- Tweaks for BitHound to ignore the fact that we are going to use the _latest version_ `AVA`, `Coveralls` and `Standard` no matter what, to reduce maintenance time spent on all my libraries.
- Some tweaks to completely pass JS Standard (there were redundant regex escapes for example)

## [2.17.0] - 2016-12-21
### Added
- Test coverage and a badge
- Changelog
- Tweaked travis and bithound setup files
- Hardened the .gitignore
- Consolidated Readme badge links to svg's and url's in the footer

### Fixed
- Renamed some tests to match better what's inside
- The latest AVA (*) is requested with an ignore on the BitHound

[2.17.0]: https://github.com/code-and-send/detergent/compare/v2.16.0...v2.17.0
[2.18.0]: https://github.com/code-and-send/detergent/compare/v2.17.0...v2.18.0
