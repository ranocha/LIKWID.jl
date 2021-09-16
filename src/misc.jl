"""
Returns the ID of the currently executing CPU.
"""
get_processor_id() = Int(LibLikwid.likwid_getProcessorId())

"""
Returns the ID of the currently executing CPU via `glibc`s `sched_getcpu` function.
"""
get_processor_id_glibc() = Int(@ccall sched_getcpu()::Cint)

"""
Pins the current process to the CPU given as `cpuid`.
"""
function pinprocess(cpuid::Integer)
    ret = LibLikwid.likwid_pinProcess(cpuid)
    return ret == 0
end

"""
Pins the current thread to the CPU given as `cpuid`.
"""
function pinthread(cpuid::Integer)
    ret = LibLikwid.likwid_pinThread(cpuid)
    return ret == 0
end

"""
Set the verbosity level of the LIKWID library. Returns `true` on success.

Options are:
  * `LIKWID.LibLikwid.DEBUGLEV_ONLY_ERROR` or `0`

  * `LIKWID.LibLikwid.DEBUGLEV_INFO` or `1`

  * `LIKWID.LibLikwid.DEBUGLEV_DETAIL` or `2`

  * `LIKWID.LibLikwid.DEBUGLEV_DEVELOP` or `3`
"""
function setverbosity(verbosity::Integer)
    if verbosity ≥ LibLikwid.DEBUGLEV_ONLY_ERROR && verbosity ≤ LibLikwid.DEBUGLEV_DEVELOP
        LibLikwid.perfmon_setVerbosity(verbosity)
        return true        
    end
    return false
end

"""
Tries to detect whether LIKWID has been compiled with GPU support.

Note: Should be replaced by a less "hacky" implementation when
https://github.com/RRZE-HPC/likwid/issues/430 has been addressed.
"""
function gpusupport()
    dlopen(liblikwid) do handle
        return !isnothing(dlsym(handle, :likwid_gpuMarkerInit; throw_error=false))
    end
end

"""
Alternative to `LIKWID.gpusupport()` based on analyzing the output of `likwid-topology`.
"""
function gpusupport_alternative()
    x = _execute(`likwid-topology`)
    # if there is a gpu section in the output, return true
    contains(lowercase(x[1]), "gpu") && return true
    # if there is a cuda related error, return true
    contains(lowercase(x[2]), "cuda") && return true
    # else
    return false
end

"Run a Cmd object, returning the stdout & stderr contents plus the exit code"
function _execute(cmd::Cmd)
  out = Pipe()
  err = Pipe()

  process = run(pipeline(ignorestatus(cmd), stdout=out, stderr=err))
  close(out.in)
  close(err.in)

  (
    stdout = String(read(out)), 
    stderr = String(read(err)),  
    code = process.exitcode
  )
end