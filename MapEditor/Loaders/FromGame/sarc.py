import sarc


def sarc_extract(sarcFile, target_dir) -> None:

    with open(sarcFile, "rb") as f:
        s = sarc.read_file_and_make_sarc(f)
        if not s:
            sys.stderr.write("Unknown file format\n")
            sys.exit(1)
        if target_dir:
            s.extract_to_dir(target_dir, print_names=False)
        else:
            s.extract(sarcFile, print_names=False)
