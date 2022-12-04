# sld2mapfile - The converter SLD file to Mapfile

## Installation

```
git clone git@github.com:tharlestsa/sld2mapfile.git && cd sld2mapfile && npm install && npm run deploy
```
## Usage

You need to navigate to the folder where the .sld is and run this command.

### One single file
```
#  sld2map --table <tablename> --sld <sld_path> > <mapfile_name>.map
```

### Multiple files

```
#  find ./ -type f -name "*.sld" -exec sld2map --table <tablename> --sld "{}" \; > <mapfile_name>.map
```

