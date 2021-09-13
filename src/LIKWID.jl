module LIKWID
   import Base.Threads

   # liblikwid
   const liblikwid = "liblikwid"
   include("LibLikwid.jl")

   # Julia types
   include("types.jl")

   # Note: underscore prefix -> liblikwid API
   const topo_initialized = Ref{Bool}(false) # Topo module of liblikwid
   const numa_initialized = Ref{Bool}(false)
   const affinity_initialized = Ref{Bool}(false)
   const timer_initialized = Ref{Bool}(false)
   const power_initialized = Ref{Bool}(false)
   const config_initialized = Ref{Bool}(false)
   const access_initialized = Ref{Bool}(false)
   const perfmon_initialized = Ref{Bool}(false)
   const _cputopo = Ref{Union{LibLikwid.CpuTopology, Nothing}}(nothing) # (Julia) API struct
   const cputopo = Ref{Union{CpuTopology, Nothing}}(nothing) # Julia struct
   const _cpuinfo = Ref{Union{LibLikwid.CpuInfo, Nothing}}(nothing) # (Julia) API struct
   const cpuinfo = Ref{Union{CpuInfo, Nothing}}(nothing) # Julia struct
   const _numainfo = Ref{Union{LibLikwid.NumaTopology, Nothing}}(nothing) # (Julia) API struct
   const numainfo = Ref{Union{NumaTopology, Nothing}}(nothing) # Julia struct
   const _affinity = Ref{Union{LibLikwid.AffinityDomains, Nothing}}(nothing) # (Julia) API struct
   const affinity = Ref{Union{AffinityDomains, Nothing}}(nothing) # Julia struct
   const _powerinfo = Ref{Union{LibLikwid.PowerInfo, Nothing}}(nothing) # (Julia) API struct
   const powerinfo = Ref{Union{PowerInfo, Nothing}}(nothing) # Julia struct
   const _config = Ref{Union{LibLikwid.Likwid_Configuration, Nothing}}(nothing) # (Julia) API struct
   const config = Ref{Union{Likwid_Configuration, Nothing}}(nothing) # Julia struct

   # functions
   include("topology.jl")
   include("numa.jl")
   include("configuration.jl")
   include("affinity.jl")
   include("timer.jl")
   include("thermal.jl")
   include("power.jl")
   include("access.jl")
   include("marker.jl")
   include("perfmon.jl")
   
   function __init__()
      Marker.init()
      Threads.@threads for i in 1:Threads.nthreads()
         Marker.threadinit()
      end
      atexit() do
         Marker.close()
      end
   end
end
