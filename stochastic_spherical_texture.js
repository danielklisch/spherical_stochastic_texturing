function vadd(a,b) {
    var c = [];
    for (var i=0;i<a.length;i++) {
        c.push(a[i]+b[i]);
    }
    return c;
}

function vsub(a,b) {
    var c = [];
    for (var i=0;i<a.length;i++) {
        c.push(a[i]-b[i]);
    }
    return c;
}

function vdot(a,b) {
    var sum = 0;
    for (var i=0;i<a.length;i++) {
        sum += a[i]*b[i];
    }
    return sum;
}

function vcross(a,b) {
    return [a[1]*b[2]-a[2]*b[1],
            a[2]*b[0]-a[0]*b[2],
            a[0]*b[1]-a[1]*b[0]];
}

function vmul(v,f) {
    var w = [];
    for (var i=0;i<v.length;i++) {
        w.push(v[i]*f);
    }
    return w;
}

function vlength(v) {
    return Math.sqrt(vdot(v,v));
}

function vnormalize(v) {
    return vmul(v,1/vlength(v));
}

function vfloor(v) {
    var w = [];
    for (var i=0;i<v.length;i++) {
        w.push(Math.floor(v[i]));
    }
    return w;
}

function vblend(a,b,f) {
    return vadd(vmul(a,1-f),vmul(b,f));
}

function frac(x) {
    return x-Math.floor(x);
}

function vhash(v) {
    return [frac(1931*Math.sin(93.46*v[0]+64.39*v[1]+83.36*v[2]+65.83*_Seed)),
            frac(1404*Math.sin(24.57*v[0]+75.42*v[1]+68.32*v[2]+83.56*_Seed)),
            frac(9824*Math.sin(82.65*v[0]+56.28*v[1]+15.72*v[2]+13.46*_Seed))];
}  

class Matrix3x3 {
    constructor(u,v,w) {
        this.a = u[0];
        this.b = v[0];
        this.c = w[0];
        this.d = u[1];
        this.e = v[1];
        this.f = w[1];
        this.g = u[2];
        this.h = v[2];
        this.i = w[2];
    }

    fmul(f) {
        this.a *= f;
        this.b *= f;
        this.c *= f;
        this.d *= f;
        this.e *= f;
        this.f *= f;
        this.g *= f;
        this.h *= f;
        this.i *= f;
    }
    
    vmul(v) {
        return [this.a*v[0]+this.b*v[1]+this.c*v[2],this.d*v[0]+this.e*v[1]+this.f*v[2],this.g*v[0]+this.h*v[1]+this.i*v[2]];
    }
    
    det() {
        return this.a*this.e*this.i+this.b*this.f*this.g+this.c*this.d*this.h-this.g*this.e*this.c-this.h*this.f*this.a-this.i*this.d*this.b;
    }
    
    inverse() {
        var m = new Matrix3x3([0,0,0],[0,0,0],[0,0,0]);
        m.a = this.e*this.i-this.f*this.h;
        m.b = this.c*this.h-this.b*this.i;
        m.c = this.b*this.f-this.c*this.e;
        m.d = this.f*this.g-this.d*this.i;
        m.e = this.a*this.i-this.c*this.g;
        m.f = this.c*this.d-this.a*this.f;
        m.g = this.d*this.h-this.e*this.g;
        m.h = this.b*this.g-this.a*this.h;
        m.i = this.a*this.e-this.b*this.d;
        m.fmul(1.0/this.det());
        return m;
    }
}

function get_pixel(x,y) {
    x = Math.min(Math.max(x,0),canvas_content.width-1);
    y = Math.min(Math.max(y,0),canvas_content.height-1);
    return [data_content[(canvas_content.width*y+x)*4+0]/255.0,data_content[(canvas_content.width*y+x)*4+1]/255.0,data_content[(canvas_content.width*y+x)*4+2]/255.0];
}

function sample_texture(uv) {
    var u = uv[0]*canvas_content.width;
    var v = uv[1]*canvas_content.height;     
    var x = Math.floor(u);
    var y = Math.floor(v);
    u -= x;
    v -= y;   
    return vblend(vblend(get_pixel(x,y),get_pixel(x+1,y),u),vblend(get_pixel(x,y+1),get_pixel(x+1,y+1),u),v);
}

function Rotate2D(pos,a) {
    a *= 6.2831;
    return [Math.cos(a)*pos[0]-Math.sin(a)*pos[1],Math.cos(a)*pos[1]+Math.sin(a)*pos[0]];
}    

function apply_margin(uv) {
    return vadd([_Scale,_Scale],vmul(uv,1-2*_Scale));
}

function color(index,p,grid) {
    var n = vnormalize(index);
    var rd = vhash(index);
    var dirU = vnormalize(vcross(n,rd));
    var dirV = vnormalize(vcross(n,dirU));
    var m = new Matrix3x3(dirU,dirV,n);
    m = m.inverse();    
    var uvw = vmul(vsub(vnormalize(p),n),grid*_Scale);
    uvw = m.vmul(uvw);
    var r = vhash(vmul(index,42));
    var uv = vadd(apply_margin([r[0],r[1]]),Rotate2D([uvw[0],uvw[1]],r[2]));          
    return sample_texture(uv);
}

function color_cube(pos,grid) { 
    var index = [0,0,0];
    var c = [0,0,0];
    if (pos[0] > Math.abs(pos[2]) && pos[0] > Math.abs(pos[1])) {
        pos = vmul(pos,grid/Math.abs(pos[0]));
        index = vfloor(pos);
        index[0] = grid;
        var uv = vsub([pos[2],pos[1]],[index[2],index[1]]);
        c = (vblend(vblend(color(vadd(index,[0,0,0]),pos,grid),color(vadd(index,[0,0,1]),pos,grid),uv[0]),
                    vblend(color(vadd(index,[0,1,0]),pos,grid),color(vadd(index,[0,1,1]),pos,grid),uv[0]),uv[1]));                    
    }
    if (-pos[0] > Math.abs(pos[2]) && -pos[0] > Math.abs(pos[1])) {
        pos = vmul(pos,grid/Math.abs(pos[0]));
        index = vfloor(pos);
        index[0] = -grid;
        var uv = vsub([pos[2],pos[1]],[index[2],index[1]]);
        c = (vblend(vblend(color(vadd(index,[0,0,0]),pos,grid),color(vadd(index,[0,0,1]),pos,grid),uv[0]),
                    vblend(color(vadd(index,[0,1,0]),pos,grid),color(vadd(index,[0,1,1]),pos,grid),uv[0]),uv[1]));                      
    } 
    if (pos[1] > Math.abs(pos[0]) && pos[1] > Math.abs(pos[2])) {
        pos = vmul(pos,grid/Math.abs(pos[1]));
        index = vfloor(pos);
        index[1] = grid;
        var uv = vsub([pos[0],pos[2]],[index[0],index[2]]);
        c = (vblend(vblend(color(vadd(index,[0,0,0]),pos,grid),color(vadd(index,[1,0,0]),pos,grid),uv[0]),
                    vblend(color(vadd(index,[0,0,1]),pos,grid),color(vadd(index,[1,0,1]),pos,grid),uv[0]),uv[1]));                      
    }
    if (-pos[1] > Math.abs(pos[0]) && -pos[1] > Math.abs(pos[2])) {
        pos = vmul(pos,grid/Math.abs(pos[1]));
        index = vfloor(pos);
        index[1] = -grid;
        var uv = vsub([pos[0],pos[2]],[index[0],index[2]]);
        c = (vblend(vblend(color(vadd(index,[0,0,0]),pos,grid),color(vadd(index,[1,0,0]),pos,grid),uv[0]),
                    vblend(color(vadd(index,[0,0,1]),pos,grid),color(vadd(index,[1,0,1]),pos,grid),uv[0]),uv[1]));                                
    }                 
    if (pos[2] > Math.abs(pos[0]) && pos[2] > Math.abs(pos[1])) {
        pos = vmul(pos,grid/Math.abs(pos[2]));
        index = vfloor(pos);
        index[2] = grid;
        var uv = vsub([pos[0],pos[1]],[index[0],index[1]]);
        c = (vblend(vblend(color(vadd(index,[0,0,0]),pos,grid),color(vadd(index,[1,0,0]),pos,grid),uv[0]),
                    vblend(color(vadd(index,[0,1,0]),pos,grid),color(vadd(index,[1,1,0]),pos,grid),uv[0]),uv[1]));                                  
    }
    if (-pos[2] > Math.abs(pos[0]) && -pos[2] > Math.abs(pos[1])) {
        pos = vmul(pos,grid/Math.abs(pos[2]));
        index = vfloor(pos);
        index[2] = -grid;
        var uv = vsub([pos[0],pos[1]],[index[0],index[1]]);
        c = (vblend(vblend(color(vadd(index,[0,0,0]),pos,grid),color(vadd(index,[1,0,0]),pos,grid),uv[0]),
                    vblend(color(vadd(index,[0,1,0]),pos,grid),color(vadd(index,[1,1,0]),pos,grid),uv[0]),uv[1]));                       
    }           
    return c;
}

function color_pixel(x,y) {
    var uv = [x/canvas_result.width,y/canvas_result.height];    
    uv[1] -= 0.5;
    var pos = vnormalize([Math.cos(uv[1]*3.1415)*Math.cos(uv[0]*6.2831),Math.sin(uv[1]*3.1415),Math.cos(uv[1]*3.1415)*Math.sin(uv[0]*6.2831)]);    
    
    var c = [0,0,0];
    var sum = 0;
    var grid = _Grid;
    var s = 1;    
    for (var i=0;i<_Octaves;i++) {
        c = vadd(c,vmul(color_cube(pos,grid),s));
        sum += s;
        s /= 2;
        grid *= 2;
    }  
    return vmul(c,1/sum);
}