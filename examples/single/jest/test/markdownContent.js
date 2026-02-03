export const markdownContent = `# Markdown Syntax Showcase

## Headers
### Different Header Levels
#### Are Supported
##### In Markdown
###### Even Smallest Headers

<br>

## Text Formatting
*Italic Text*
**Bold Text**
***Bold and Italic***
~~Strikethrough Text~~

<br>

## Lists
### Unordered Lists
- First item
- Second item
 * Nested item
 * Another nested item

<br>

### Ordered Lists
1. First ordered item
2. Second ordered item
  1. Nested ordered item
  2. Another nested ordered item

<br>

#   # Links
[Inline Link](https://www.example.com)
[Link with Title](https://www.example.com "Website Title")
<https://www.example.com>
[Reference-style Link][Reference]
[Reference]: https://www.example.com

<br>

## Code
### Inline Code
Here is some \`inline code\`

### Code Blocks
\`\`\`javascript
function exampleCode() {
 return "Code blocks are supported";
}
\`\`\`

\`\`\`python
def python_example():
   return "Multiple language syntax highlighting"
\`\`\`

<br>

## Blockquotes
> This is a blockquote
> 
> It can span multiple lines
> 
> ### Even with Headers Inside
> 
> - And lists
> - Are possible

<br>

## Horizontal Rules
---
***
___

<br>

## Tables
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |

<br>

## Task Lists
- [x] Completed task
- [ ] Incomplete task
- [ ] Another incomplete task

<br>

## Footnotes
Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

<br>

## HTML Inline Elements
Some <u>underlined</u> and <sup>superscript</sup> text.

<br>

## Escaping Characters
\\*This is not italicized\\*
\\# This is a literal hash`;
