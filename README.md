# bundler

## package.json

```
{
  ....
  "bundles": [
    {
      "output": "path/bundle.zip",
      "files": [...],
      "packages": [...],
      "replacePath": {
        "replace what": "replace with"
      }
    }
  ]
}
```

## run

```
npx bundle --path=./
```
