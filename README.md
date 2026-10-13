# quartz-ascii-anim

ASCII art animations for [Quartz](https://quartz.jzhao.xyz) v5 digital gardens.

Write your frames as plain text in a note, and the plugin turns the code block into a looping animation in the browser. Each animation is a normal Markdown file, so you can reuse it anywhere in your garden with `![[name]]`.

## Installation

From the root of your Quartz project:

````
npx quartz plugin add github:MarcoCuzzi/quartz-ascii-anim
````

Then check that `quartz.config.yaml` contains the plugin entry:

````yaml
plugins:
  - source: github:MarcoCuzzi/quartz-ascii-anim
    enabled: true
````

Restart your dev server (`npx quartz build --serve`) after installing.

## Usage

Create a note, for example `ascii-art/flower.md`, with a code block like this:

````md
```text
animation
fps: 4
<frame>
  _
 (_)
  |
<frame>
  _
 (@)
  |
<frame>
  _
 (*)
  |
```
````

Then show it from any note:

````md
![[ascii-art/flower]]
````

You can also put the code block directly in the note where you want the animation.

### Format

| Part | Required | Description |
| --- | --- | --- |
| `animation` | yes | Must be the **first line** of the code block. Blocks that do not start with it are never touched. |
| `key: value` lines | no | Settings, one per line, before the first `<frame>`. |
| `<frame>` | yes | Starts a new frame. Everything until the next `<frame>` is one drawing. |

Blank lines at the start and end of each frame are removed. To keep vertical padding, use a space or another visible character.

### Settings

| Setting | Default | Description |
| --- | --- | --- |
| `fps` | `4` | Frames per second. Clamped between `fpsMin` and `fpsMax`. |
| `bare` | off | `bare: yes` (or `true`) shows only the drawing: no title, no "Link to original", no frame around it. |
| `size` | `100` | Scale of the drawing as a percentage of normal size (10–300). |
| `fit` | off | `fit: yes` shrinks the drawing, if needed, so its widest line fits the width of the page column. Combines with `size`: `size` is the starting size and `fit` only shrinks further. |

## Plugin options

Defaults can be changed in `quartz.config.yaml`:

````yaml
plugins:
  - source: github:MarcoCuzzi/quartz-ascii-anim
    enabled: true
    options:
      fpsMin: 1
      fpsMax: 30
      fpsDefault: 4
      maxFrames: 100
````

| Option | Default | Description |
| --- | --- | --- |
| `fpsMin` | `1` | Lowest accepted `fps`. |
| `fpsMax` | `30` | Highest accepted `fps`. |
| `fpsDefault` | `4` | Used when `fps` is missing or not a number. |
| `maxFrames` | `100` | Frames beyond this limit are ignored. |

## Behaviour and safety

- **Reduced motion:** if the visitor has "reduce motion" enabled in their system, the first frame is shown and nothing animates.
- **Limits:** `fps` and the number of frames are capped, so a typo cannot freeze a page.
- **Plain text only:** frames are written with `textContent`, never as HTML, so markup inside a drawing is displayed, not executed.
- **SPA navigation:** timers are cleaned up when you navigate between pages.

## How it works

The plugin is a Quartz transformer that injects a small inline script into every page. On each navigation the script looks for `pre code` blocks whose first line is `animation`, splits them on `<frame>`, and replaces each block with a `<pre class="ascii-anim">` that cycles through the frames.

You can style the animation with CSS using the `.ascii-anim` class (and `.ascii-anim.bare` for the bare variant), for example in `quartz/styles/custom.scss`.

## Updating and removing

The plugin is cloned into your project, so a new version needs a reinstall:

````
npx quartz plugin remove quartz-ascii-anim
npx quartz plugin add github:MarcoCuzzi/quartz-ascii-anim
````

## Development

````
npm install
npm run build
````

The compiled `dist/` folder is committed to the repository on purpose: Quartz installs the plugin straight from it. Always run `npm run build` and commit `dist/` before pushing.

## License

MIT