<div align="center">
  <img width="390px" src="https://raw.githubusercontent.com/JuliaPerf/LIKWID.jl/main/docs/src/assets/logo_with_txt.svg">
</div>

<br>

[![](https://img.shields.io/badge/docs-dev-blue.svg)](https://juliaperf.github.io/LIKWID.jl/dev/)
[![Build Status](https://github.com/JuliaPerf/LIKWID.jl/workflows/CI/badge.svg)](https://github.com/JuliaPerf/LIKWID.jl/actions)
[![Build Status](https://gitlab.rrze.fau.de/ub55yzis/LIKWID.jl/badges/main/pipeline.svg?key_text=NHR@FAU&key_width=70)](https://gitlab.rrze.fau.de/ub55yzis/LIKWID.jl/-/pipelines)
[![codecov](https://codecov.io/gh/JuliaPerf/LIKWID.jl/branch/main/graph/badge.svg?token=Ze61CbGoO5)](https://codecov.io/gh/JuliaPerf/LIKWID.jl)
![lifecycle](https://img.shields.io/badge/lifecycle-maturing-blue.svg)

*Like I Knew What I am Doing*

LIKWID.jl is a Julia wrapper for the performance monitoring and benchmarking suite [LIKWID](https://github.com/RRZE-HPC/likwid).

## Installation

Prerequisites:
* You must have `likwid` installed (see the [build & install instructions](https://github.com/RRZE-HPC/likwid#download-build-and-install)).
* **You must be running Linux.** (LIKWID doesn't support macOS or Windows.)

LIKWID.jl is a registered Julia package. Hence, you can simply add it to your Julia environment with the command
```julia
] add LIKWID
```

## Documentation

Please check out [the documentation](https://juliaperf.github.io/LIKWID.jl/dev/) to learn how to use LIKWID.jl.

## Example: Marker API (CPU + GPU)

TODO

## Resources

* [LIKWID](https://github.com/RRZE-HPC/likwid) / [LIKWID Performance Tools](https://hpc.fau.de/research/tools/likwid/)
* Most C-bindings have been autogenerated using [Clang.jl](https://github.com/JuliaInterop/Clang.jl)
* [pylikwid](https://github.com/RRZE-HPC/pylikwid): Python wrappers of LIKWID
