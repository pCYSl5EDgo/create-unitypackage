# create-unitypackage

Create unitypackage file without Unity Editor Installation.

## Usage

### Pre-requisites

Create a workflow `.yml` file in your repositories `.github/workflows` directory. An [example workflow](#example-workflow) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Required Inputs

* `package-path` - Output unitypackage path.
* `include-files` - Include files&amp;directories. This argument should be multi-line content. Each line should ends with .meta file extension. Do not forget about directories.

### Not Required Inputs

* `project-folder` - Unity project folder. Default Value => &quot;./&quot;

### Example workflow

```yaml
name: Create Unity Package

on: push

jobs:
  echo:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - run: |
        echo "Assets/Voiceer.meta" > metaList
        find ./Assets/Voiceer/ -name \*.meta >> metaList
    - uses: pCYSl5EDgo/cat@master
      id: metas
      with:
        path: metaList
        trim: true

    - run: mkdir a

    - uses: pCYSl5EDgo/create-unitypackage@master
      with:
        package-path: 'a/output.unitypackage'
        include-files: ${{ steps.metas.outputs.text }}
    - uses: actions/upload-artifact@master
      with:
        path: a
        name: package
```

## License
The scripts and documentation in this project are released under the [MIT License](LICENSE)