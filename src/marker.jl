module Marker

using ..LIKWID: LibLikwid, PerfMon, capture_stderr!

"""
Initialize the Marker API. Must be called previous to all other functions.
"""
function init()
    LibLikwid.likwid_markerInit()
    Threads.@threads :static for i in 1:Threads.nthreads()
        LibLikwid.likwid_markerThreadInit()
    end
    return nothing
end

"""
Initialize the Marker API only on the main thread. `LIKWID.Marker.threadinit()` must be called manually.
"""
init_nothreads() = LibLikwid.likwid_markerInit()

"""
Add the current thread to the Marker API.
"""
threadinit() = LibLikwid.likwid_markerThreadInit()

"""
Register a region with name `regiontag` to the Marker API. On success, `true` is returned.

This is an optional function to reduce the overhead of region registration at `Marker.startregion`.
If you don't call `registerregion`, the registration is done at `startregion`.
"""
function registerregion(regiontag::AbstractString)
    ret = LibLikwid.likwid_markerRegisterRegion(regiontag)
    return ret == 0
end

"""
Start measurements under the name `regiontag`. On success, `true` is returned.
"""
function startregion(regiontag::AbstractString)
    ret = LibLikwid.likwid_markerStartRegion(regiontag)
    return ret == 0
end

"""
Stop measurements under the name `regiontag`. On success, `true` is returned.
"""
function stopregion(regiontag::AbstractString)
    ret = LibLikwid.likwid_markerStopRegion(regiontag)
    return ret == 0
end

"""
    getregion(regiontag::AbstractString, [num_events]) -> nevents, events, time, count
Get the intermediate results of the region identified by `regiontag`. On success, it returns
    * `nevents`: the number of events in the current group,
    * `events`: a list with all the aggregated event results,
    * `time`: the measurement time for the region and
    * `count`: the number of calls.
"""
function getregion(regiontag::AbstractString)
    current_group = PerfMon.get_id_of_active_group()
    return getregion(regiontag, PerfMon.get_number_of_events(current_group))
end

function getregion(regiontag::AbstractString, num_events::Integer)
    nevents = Ref(Int32(num_events))
    events = zeros(nevents[])
    time = Ref(0.0)
    count = Ref(Int32(0))
    LibLikwid.likwid_markerGetRegion(regiontag, nevents, events, time, count)
    return nevents[], events, time[], count[]
end

"""
Switch to the next event set in a round-robin fashion.
If you have set only one event set on the command line, this function performs no operation.
"""
nextgroup() = LibLikwid.likwid_markerNextGroup()

"""
Reset the values stored using the region name `regiontag`.
On success, `true` is returned.
"""
function resetregion(regiontag::AbstractString)
    ret = LibLikwid.likwid_markerResetRegion(regiontag)
    return ret == 0
end

"""
Close the connection to the LIKWID Marker API and write out measurement data to file.
This file will be evaluated by `likwid-perfctr`.
"""
close() = LibLikwid.likwid_markerClose()

"""
Checks whether the Marker API is active, i.e. julia has been started under `likwid-perfctr -C ... -g ... -m`.
"""
isactive() = !isnothing(get(ENV, "LIKWID_MODE", nothing))

"""
    region(f, regiontag::AbstractString)
Adds a LIKWID marker region around the execution of the given function `f` using [`Marker.startregion`](@ref),
[`Marker.stopregion`](@ref) under the hood.
Note that `LIKWID.Marker.init()` and `LIKWID.Marker.close()` must be called before and after, respectively.

# Examples
```julia
julia> using LIKWID

julia> Marker.init()

julia> region("sleeping...") do
           sleep(1)
       end
true

julia> region(()->rand(100), "create rand vec")
true

julia> Marker.close()

```
"""
function region(f, regiontag::AbstractString)
    Marker.startregion(regiontag)
    f()
    return Marker.stopregion(regiontag)
end

"""
Convenience macro for flanking code with [`Marker.startregion`](@ref) and [`Marker.stopregion`](@ref).

# Examples
```julia
julia> using LIKWID

julia> Marker.init()

julia> @region "sleeping..." sleep(1)
true

julia> @region "create rand vec" rand(100)
true

julia> Marker.close()

```
"""
macro region(regiontag, expr)
    q = quote
        LIKWID.Marker.startregion($regiontag)
        $(expr)
        LIKWID.Marker.stopregion($regiontag)
    end
    return esc(q)
end

end # module
