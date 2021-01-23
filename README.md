# Spherical Stochastic Texturing

<img src='figures/figure1.png'/>

This algorithm generates random textures for spheres from example inputs.
It was inspired by [Procedural Stochastic Texturing](https://github.com/UnityLabs/procedural-stochastic-texturing).

You can try out the web demo [here](https://danielklisch.github.io/spherical_stochastic_texturing/).

## Examples

Spherical Stochastic Texturing can be used to seamlessly project textures onto spheres:

<img src='figures/figure2.png'/>

It can also be used to generate random variations from a single input:

<img src='figures/figure3.png'/>

<img src='figures/figure4.png'/>

<img src='figures/figure5.png'/>

To generate high resolution detail Spherical Stochastic Texturing can be blended at different scales in a similar way to [fractal noise](https://thebookofshaders.com/13/).
The "Noise Octaves" parameter controls how many times Spherical Stochastic Texturing is applied at different scales:

<img src='figures/figure6.png'/>

<img src='figures/figure7.png'/>

For the first examples textures from [shadertoy](https://www.shadertoy.com/view/tdSSzV) were used.
The maps of [mars](https://trek.nasa.gov/mars/) and the [moon](https://trek.nasa.gov/moon/) came from NASA.

## How It Works

Spherical Stochastic Texturing works similarly to the original [Procedural Stochastic Texturing](https://github.com/UnityLabs/procedural-stochastic-texturing):
It interpolates between patches that are sampled at grid points.
However, instead of a flat triangular grid, Spherical Stochastic Texturing uses the vertices of a subdivided cube projected onto a sphere.
The size of the patches can be adjusted using the "Texture Scale" parameter, and the grid resolution using the "Grid Scale" parameter.
Since the blending of patches changes the color distribution, [Histogram Transfer](https://github.com/danielklisch/histogram_transfer) can be used to match the original distribution.
