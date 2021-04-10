import setuptools
import pathlib

with open("README.md", "r") as desc:
    long_description = desc.read()


setuptools.setup(
    name="MapEditor",
    version="0.0.1",
    description="Ice spear, but better",
    long_description=long_description,
    long_description_content_type="text/markdown",
    include_package_data=True,
    packages=['MapEditor'],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.7',
    install_requires=[
        "oead>=1.1.1",
        "open3d>=0.10.0.1",
        "pathlib",
        "pywebview>=3.2",
        "blwpprod>=1.1.2",
	"pycollada"
    ],
)