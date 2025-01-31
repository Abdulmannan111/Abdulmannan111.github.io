# CloudCannon Svelte Connector
Give your editors a live visual editing experience by connecting your Svelte site to [CloudCannon](https://cloudcannon.com).

## Installation
```bash
npm i @cloudcannon/svelte-connector
```

## Example Site
This repository contains a [minimal example site](https://github.com/CloudCannon/svelte-connector/tree/main/exampleSite).
You can upload this site to CloudCannon to test live editing for yourself.

## Usage

### Requirements for Live Editing
 - Components must have an output URL. SvelteKit routes are a good example.
 - Components must get their data from a data/content file somewhere in your project. This is critical, as the Visual Editor cannot open the components themselves.
 - These data/content files must be configured as a CloudCannon Collection. See the [CloudCannon Reader documentation](https://github.com/CloudCannon/reader#readme) for more information.
 - Components will need to use the Svelte `onDestroy` and `onMount` functions.


 Add the following code to the component/page you wish to live edit:

 ```html
 <script>
  import { onDestroy, onMount } from 'svelte';
  import { onCloudCannonChanges, stopCloudCannonChanges } from '@cloudcannon/svelte-connector';

  // pageDetails is passed from parent, or via SvelteKit load function
  export let pageDetails;

  onMount(async () => {
    onCloudCannonChanges((newProps) => pageDetails = newProps);
  });

  onDestroy(async () => {
    stopCloudCannonChanges();
  });
</script>
```

In the above code, `pageDetails` is an object that contains data for the markup portion of the component.
After loading the content file in the Visual Editor, changing the data in the sidebar will push the new props to `pageDetails`.
This will display the new values in the Visual Editor immediately.


## Live Editing in CloudCannon
Once configured, open your site in CloudCannon. Open your collection in the sidebar, then open the page you wish to edit.
Alternatively, open the content file in the CloudCannon file browser, and then switch to the Visual Editor.

Make changes to your data in the sidebar. Your new content will immediately update in the Visual Editor.
