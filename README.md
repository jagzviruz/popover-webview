#### About Task

This was an interesting task. I have tried to develop a script that can be used to create a preview popup in a page for specific links.

The links which are linking to a specified site will be enabled with the preview if they are not annotated with `data-noembed`


#### Developer Instructions
- Clone the repo
- Execute the Following instructions in the root of the repo.
```
> npm install
> npm run dev
```
This will open the browser in `http://localhost:1234` and start an Express server on `http://localhost:3001`

The sample webpage has a list of links. In this the links which are pointing to 'developer.mozilla.org' and NOT having the `data-noembed` attribute are syled in an Orange box with a search icon.

Since most websites implement measures to prevent being embedded in a iFrame using CSP, I have implemented a Server component which `fetches` the page's HTML and sends the HTML back in a JSON.

The JSON response also indicates, if the URL can be directly embedded in the page.

##### Features:
- Hovering over a link styled in Orange and with the Search Icon will prefetch the page.
- Clicking on the links with the Search Icon will open the page in a preview popup.
- If the URL is from a site that cannot be embedded, the content in the popup is not vey functional. While all the CSS and styling works, scripts will fail.
- Clicking on the backdrop will dismiss the popup.

#### Build
```
> npm run build
```

Generates a `popover.js` and `popover.css` that should be linked in yout HTML page.

#### Usage
In your `app.js` you have to invoke the script along these lines
```js
import Popover from './popover';

document.addEventListener('DOMContentLoaded', () => {
  new Popover('developer.mozilla.org', '.hover-sensitive');
});

```

