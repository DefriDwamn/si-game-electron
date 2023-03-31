function gcd(u, v) {
    if (u === v) return u;
    if (u === 0) return v;
    if (v === 0) return u;

    if (~u & 1)
        if (v & 1)
            return gcd(u >> 1, v);
        else
            return gcd(u >> 1, v >> 1) << 1;

    if (~v & 1) return gcd(u, v >> 1);

    if (u > v) return gcd((u - v) >> 1, v);

    return gcd((v - u) >> 1, u);
}

function ratio(w, h) {
    var d = gcd(w, h);
    return [w / d, h / d];
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end
};
module.exports = {
    ratio,
    lerp
}