// =============================================
// SUBNET CALCULATOR - JavaScript
// Complete Professional Subnetting Tool
// IPv4 CIDR /1-/32 | IPv6 Prefix /1-/128
// =============================================

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.getElementById('ipv4-section').style.display = tab === 'ipv4' ? 'block' : 'none';
        document.getElementById('ipv6-section').style.display = tab === 'ipv6' ? 'block' : 'none';
    });
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('subnet-theme') || 'light';
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.querySelector('.sun-icon').style.display = 'none';
    themeToggle.querySelector('.moon-icon').style.display = 'block';
}
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.querySelector('.sun-icon').style.display = isDark ? 'none' : 'block';
    themeToggle.querySelector('.moon-icon').style.display = isDark ? 'block' : 'none';
    localStorage.setItem('subnet-theme', isDark ? 'dark' : 'light');
});

// =============================================
// IPv4 CLASS SELECTION BUTTONS
// =============================================
document.querySelectorAll('.class-btn[data-class]').forEach(btn => {
    btn.addEventListener('click', () => {
        const ip = btn.dataset.ip;
        const cidr = btn.dataset.cidr;
        document.getElementById('ipv4-address').value = ip;
        document.getElementById('ipv4-cidr').value = cidr;

        // Add active state to button
        document.querySelectorAll('.class-btn[data-class]').forEach(b => b.style.background = '');
        btn.style.background = 'rgba(99, 102, 241, 0.2)';

        // Auto calculate
        calculateIPv4();
    });
});

// IPv6 Type Selection Buttons
document.querySelectorAll('.ipv6-type-buttons .class-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const ip = btn.dataset.ip;
        const prefix = btn.dataset.prefix;
        document.getElementById('ipv6-address').value = ip;
        document.getElementById('ipv6-prefix').value = prefix;

        // Add active state
        document.querySelectorAll('.ipv6-type-buttons .class-btn').forEach(b => b.style.background = '');
        btn.style.background = 'rgba(99, 102, 241, 0.2)';

        // Auto calculate
        calculateIPv6();
    });
});

// =============================================
// IPv4 SUBNETTING - Complete /1 to /32 Support
// =============================================

// CIDR to Subnet Mask Mapping (Complete /1 to /32)
const cidrToMaskMap = {
    1: '128.0.0.0',
    2: '192.0.0.0',
    3: '224.0.0.0',
    4: '240.0.0.0',
    5: '248.0.0.0',
    6: '252.0.0.0',
    7: '254.0.0.0',
    8: '255.0.0.0',
    9: '255.128.0.0',
    10: '255.192.0.0',
    11: '255.224.0.0',
    12: '255.240.0.0',
    13: '255.248.0.0',
    14: '255.252.0.0',
    15: '255.254.0.0',
    16: '255.255.0.0',
    17: '255.255.128.0',
    18: '255.255.192.0',
    19: '255.255.224.0',
    20: '255.255.240.0',
    21: '255.255.248.0',
    22: '255.255.252.0',
    23: '255.255.254.0',
    24: '255.255.255.0',
    25: '255.255.255.128',
    26: '255.255.255.192',
    27: '255.255.255.224',
    28: '255.255.255.240',
    29: '255.255.255.248',
    30: '255.255.255.252',
    31: '255.255.255.254',
    32: '255.255.255.255'
};

function ipToInt(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

function intToIp(int) {
    return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
}

function cidrToMask(cidr) {
    if (cidr === 0) return 0;
    return (0xFFFFFFFF << (32 - cidr)) >>> 0;
}

function maskToString(mask) {
    return intToIp(mask);
}

function getIPClass(ip) {
    const firstOctet = parseInt(ip.split('.')[0]);
    if (firstOctet >= 1 && firstOctet <= 126) return 'Class A';
    if (firstOctet === 127) return 'Loopback (127.x.x.x)';
    if (firstOctet >= 128 && firstOctet <= 191) return 'Class B';
    if (firstOctet >= 192 && firstOctet <= 223) return 'Class C';
    if (firstOctet >= 224 && firstOctet <= 239) return 'Class D (Multicast)';
    if (firstOctet >= 240 && firstOctet <= 255) return 'Class E (Reserved)';
    return 'Unknown';
}

function getIPClassInfo(ip) {
    const firstOctet = parseInt(ip.split('.')[0]);
    if (firstOctet >= 1 && firstOctet <= 126) {
        return { class: 'A', color: '#3b82f6', defaultCidr: 8, networkBits: 8, hostBits: 24 };
    }
    if (firstOctet >= 128 && firstOctet <= 191) {
        return { class: 'B', color: '#10b981', defaultCidr: 16, networkBits: 16, hostBits: 16 };
    }
    if (firstOctet >= 192 && firstOctet <= 223) {
        return { class: 'C', color: '#f59e0b', defaultCidr: 24, networkBits: 24, hostBits: 8 };
    }
    if (firstOctet >= 224 && firstOctet <= 239) {
        return { class: 'D', color: '#8b5cf6', defaultCidr: null, networkBits: null, hostBits: null };
    }
    if (firstOctet >= 240 && firstOctet <= 255) {
        return { class: 'E', color: '#ef4444', defaultCidr: null, networkBits: null, hostBits: null };
    }
    return { class: 'Unknown', color: '#64748b', defaultCidr: null, networkBits: null, hostBits: null };
}

function getIPType(ip) {
    const octets = ip.split('.').map(Number);
    if (octets[0] === 10) return 'Private (Class A - RFC 1918)';
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return 'Private (Class B - RFC 1918)';
    if (octets[0] === 192 && octets[1] === 168) return 'Private (Class C - RFC 1918)';
    if (octets[0] === 127) return 'Loopback (localhost)';
    if (octets[0] === 169 && octets[1] === 254) return 'Link-Local (APIPA)';
    if (octets[0] === 0) return 'Current Network';
    if (octets[0] >= 224 && octets[0] <= 239) return 'Multicast';
    if (octets[0] >= 240 && octets[0] <= 254) return 'Reserved (Experimental)';
    if (octets[0] === 255) return 'Broadcast';
    if (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) return 'Shared Address Space (RFC 6598)';
    if (octets[0] === 192 && octets[1] === 0 && octets[2] === 0) return 'IETF Protocol Assignments';
    if (octets[0] === 192 && octets[1] === 0 && octets[2] === 2) return 'Documentation (TEST-NET-1)';
    if (octets[0] === 198 && octets[1] === 51 && octets[2] === 100) return 'Documentation (TEST-NET-2)';
    if (octets[0] === 203 && octets[1] === 0 && octets[2] === 113) return 'Documentation (TEST-NET-3)';
    return 'Public (Globally Routable)';
}

function intToBinary(int) {
    return int.toString(2).padStart(32, '0').match(/.{8}/g).join('.');
}

function ipToBinary(ip) {
    return ip.split('.').map(octet => parseInt(octet).toString(2).padStart(8, '0')).join('.');
}

function calculateIPv4() {
    const ipInput = document.getElementById('ipv4-address').value.trim();
    const cidr = parseInt(document.getElementById('ipv4-cidr').value);

    // Validate IP
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(ipInput)) {
        alert('Please enter a valid IPv4 address (e.g., 192.168.1.0)');
        return;
    }

    const octets = ipInput.split('.').map(Number);
    if (octets.some(o => o < 0 || o > 255)) {
        alert('Each octet must be between 0 and 255');
        return;
    }

    const ip = ipToInt(ipInput);
    const mask = cidrToMask(cidr);
    const wildcard = ~mask >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | wildcard) >>> 0;
    const firstHost = cidr >= 31 ? network : network + 1;
    const lastHost = cidr >= 31 ? broadcast : broadcast - 1;
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;

    // Update results
    document.getElementById('r-network').textContent = intToIp(network);
    document.getElementById('r-broadcast').textContent = intToIp(broadcast);
    document.getElementById('r-first').textContent = intToIp(firstHost);
    document.getElementById('r-last').textContent = intToIp(lastHost);
    document.getElementById('r-hosts').textContent = totalHosts.toLocaleString();
    document.getElementById('r-usable').textContent = usableHosts.toLocaleString();
    document.getElementById('r-mask').textContent = maskToString(mask);
    document.getElementById('r-wildcard').textContent = maskToString(wildcard);
    document.getElementById('r-class').textContent = getIPClass(ipInput);
    document.getElementById('r-type').textContent = getIPType(ipInput);
    document.getElementById('r-binary').textContent = intToBinary(mask);
    document.getElementById('r-cidr').textContent = `${intToIp(network)}/${cidr}`;
    document.getElementById('r-binary-network').textContent = ipToBinary(intToIp(network));

    // Generate subnets table (show up to 256 subnets)
    generateSubnetsTable(network, cidr, mask, totalHosts);
}

function generateSubnetsTable(network, cidr, mask, hostsPerSubnet) {
    const tbody = document.getElementById('ipv4-subnets-body');
    tbody.innerHTML = '';

    // Calculate how many subnets fit in the class network
    const firstOctet = (network >>> 24) & 255;
    let classNetwork, classCidr;

    if (firstOctet >= 1 && firstOctet <= 126) { classNetwork = network & 0xFF000000; classCidr = 8; }
    else if (firstOctet >= 128 && firstOctet <= 191) { classNetwork = network & 0xFFFF0000; classCidr = 16; }
    else { classNetwork = network & 0xFFFFFF00; classCidr = 24; }

    const subnetBits = cidr - classCidr;
    const numSubnets = Math.min(Math.pow(2, Math.max(0, subnetBits)), 256);
    const wildcard = ~mask >>> 0;

    for (let i = 0; i < numSubnets; i++) {
        const subnetNetwork = (network & mask) + (i * hostsPerSubnet);
        const subnetBroadcast = subnetNetwork + hostsPerSubnet - 1;
        const subnetFirst = cidr >= 31 ? subnetNetwork : subnetNetwork + 1;
        const subnetLast = cidr >= 31 ? subnetBroadcast : subnetBroadcast - 1;
        const usable = cidr >= 31 ? hostsPerSubnet : hostsPerSubnet - 2;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${intToIp(subnetNetwork)}/${cidr}</td>
            <td>${intToIp(subnetFirst)}</td>
            <td>${intToIp(subnetLast)}</td>
            <td>${intToIp(subnetBroadcast)}</td>
            <td>${usable.toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    }
}

document.getElementById('ipv4-calculate').addEventListener('click', calculateIPv4);
document.getElementById('ipv4-address').addEventListener('keypress', e => { if (e.key === 'Enter') calculateIPv4(); });

// =============================================
// IPv6 SUBNETTING - Complete /1 to /128 Support
// =============================================
function expandIPv6(ip) {
    // Handle :: expansion
    let parts = ip.split('::');
    let left = parts[0] ? parts[0].split(':') : [];
    let right = parts[1] ? parts[1].split(':') : [];
    let missing = 8 - left.length - right.length;
    let middle = Array(missing).fill('0000');
    let full = [...left, ...middle, ...right];
    return full.map(p => p.padStart(4, '0')).join(':');
}

function abbreviateIPv6(ip) {
    let parts = ip.split(':').map(p => p.replace(/^0+/, '') || '0');
    let best = { start: -1, len: 0 };
    let curr = { start: -1, len: 0 };

    for (let i = 0; i < 8; i++) {
        if (parts[i] === '0') {
            if (curr.start === -1) curr.start = i;
            curr.len++;
        } else {
            if (curr.len > best.len) best = { ...curr };
            curr = { start: -1, len: 0 };
        }
    }
    if (curr.len > best.len) best = { ...curr };

    if (best.len > 1) {
        parts.splice(best.start, best.len, '');
        if (best.start === 0) parts.unshift('');
        if (best.start + best.len === 8) parts.push('');
    }
    return parts.join(':');
}

function getIPv6Type(ip) {
    const full = expandIPv6(ip).toLowerCase();
    if (full === '0000:0000:0000:0000:0000:0000:0000:0001') return 'Loopback';
    if (full === '0000:0000:0000:0000:0000:0000:0000:0000') return 'Unspecified';
    if (full.startsWith('fe80')) return 'Link-Local';
    if (full.startsWith('fe') && (full[2] === 'c' || full[2] === 'd' || full[2] === 'e' || full[2] === 'f')) return 'Site-Local (Deprecated)';
    if (full.startsWith('fc') || full.startsWith('fd')) return 'Unique Local (ULA)';
    if (full.startsWith('ff')) return 'Multicast';
    if (full.startsWith('2001:0db8')) return 'Documentation (RFC 3849)';
    if (full.startsWith('2001:0000')) return 'Teredo Tunneling';
    if (full.startsWith('2002:')) return '6to4 Tunneling';
    if (full.startsWith('64:ff9b')) return 'NAT64 Translation';
    if (full.startsWith('0000:0000:0000:0000:0000:ffff')) return 'IPv4-mapped IPv6';
    if (full.startsWith('2') || full.startsWith('3')) return 'Global Unicast';
    return 'Unknown';
}

function getIPv6Scope(ip) {
    const type = getIPv6Type(ip);
    if (type === 'Link-Local') return 'Link';
    if (type === 'Unique Local (ULA)') return 'Organization';
    if (type === 'Global Unicast') return 'Global';
    if (type === 'Multicast') return 'Varies';
    if (type === 'Loopback') return 'Node';
    if (type.includes('Documentation')) return 'N/A (Reserved)';
    if (type.includes('Tunneling')) return 'Global (Transition)';
    return '-';
}

function calculateIPv6() {
    const ipInput = document.getElementById('ipv6-address').value.trim();
    const prefix = parseInt(document.getElementById('ipv6-prefix').value);

    if (!ipInput) {
        alert('Please enter an IPv6 address');
        return;
    }

    try {
        const fullAddr = expandIPv6(ipInput);
        const shortAddr = abbreviateIPv6(fullAddr);

        // Calculate network address (zero out host bits)
        const parts = fullAddr.split(':').map(p => parseInt(p, 16));
        const networkParts = [...parts];

        const fullBits = prefix;
        for (let i = 0; i < 8; i++) {
            const bitStart = i * 16;
            const bitEnd = bitStart + 16;
            if (bitStart >= fullBits) {
                networkParts[i] = 0;
            } else if (bitEnd > fullBits) {
                const keepBits = fullBits - bitStart;
                const mask = (0xFFFF << (16 - keepBits)) & 0xFFFF;
                networkParts[i] = networkParts[i] & mask;
            }
        }

        const networkAddr = networkParts.map(p => p.toString(16).padStart(4, '0')).join(':');

        // First and last host
        const firstParts = [...networkParts];
        const lastParts = [...networkParts];

        for (let i = 7; i >= 0; i--) {
            const bitStart = i * 16;
            if (bitStart >= fullBits) {
                lastParts[i] = 0xFFFF;
            } else if (bitStart + 16 > fullBits) {
                const hostBits = bitStart + 16 - fullBits;
                lastParts[i] = networkParts[i] | ((1 << hostBits) - 1);
            }
        }

        const firstAddr = abbreviateIPv6(firstParts.map(p => p.toString(16).padStart(4, '0')).join(':'));
        const lastAddr = abbreviateIPv6(lastParts.map(p => p.toString(16).padStart(4, '0')).join(':'));

        // Total addresses - using BigInt for large numbers
        const hostBits = 128 - prefix;
        let totalAddresses;
        if (hostBits <= 53) {
            totalAddresses = Math.pow(2, hostBits).toLocaleString();
        } else {
            // Use BigInt for very large numbers
            const bigTotal = BigInt(2) ** BigInt(hostBits);
            if (hostBits <= 64) {
                totalAddresses = bigTotal.toLocaleString();
            } else {
                totalAddresses = `2^${hostBits} (≈ ${(Number(bigTotal / BigInt(10 ** (hostBits - 10))) * Math.pow(10, hostBits - 10)).toExponential(2)})`;
            }
        }

        // Update results
        document.getElementById('r6-full').textContent = fullAddr;
        document.getElementById('r6-short').textContent = shortAddr;
        document.getElementById('r6-network').textContent = abbreviateIPv6(networkAddr) + '/' + prefix;
        document.getElementById('r6-first').textContent = firstAddr;
        document.getElementById('r6-last').textContent = lastAddr;
        document.getElementById('r6-prefix').textContent = '/' + prefix;
        document.getElementById('r6-total').textContent = totalAddresses;
        document.getElementById('r6-type').textContent = getIPv6Type(ipInput);
        document.getElementById('r6-scope').textContent = getIPv6Scope(ipInput);

    } catch (e) {
        alert('Invalid IPv6 address format');
        console.error(e);
    }
}

document.getElementById('ipv6-calculate').addEventListener('click', calculateIPv6);
document.getElementById('ipv6-address').addEventListener('keypress', e => { if (e.key === 'Enter') calculateIPv6(); });

// =============================================
// PARTICLE ANIMATION
// =============================================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

for (let i = 0; i < 50; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// =============================================
// INITIAL SAMPLE CALCULATION
// =============================================
// Set default values and calculate on page load
window.addEventListener('load', () => {
    document.getElementById('ipv4-address').value = '192.168.1.0';
    document.getElementById('ipv4-cidr').value = '24';
    calculateIPv4();
});

// =============================================
// FLSM & VLSM CALCULATOR
// =============================================

// Method Tab Switching
document.querySelectorAll('.method-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.method-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const method = tab.dataset.method;
        document.getElementById('flsm-content').style.display = method === 'flsm' ? 'block' : 'none';
        document.getElementById('vlsm-content').style.display = method === 'vlsm' ? 'block' : 'none';
    });
});

// FLSM Mode Toggle
document.querySelectorAll('.flsm-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.flsm-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        document.getElementById('flsm-strict-inputs').style.display = mode === 'strict' ? 'block' : 'none';
        document.getElementById('flsm-hybrid-inputs').style.display = mode === 'hybrid' ? 'block' : 'none';
    });
});

// FLSM Requirement Type Toggle (for Strict mode)
document.querySelectorAll('.req-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.req-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const req = btn.dataset.req;
        document.getElementById('flsm-subnets-group').style.display = req === 'subnets' ? 'block' : 'none';
        document.getElementById('flsm-hosts-group').style.display = req === 'hosts' ? 'block' : 'none';
    });
});

// FLSM Calculator
function calculateFLSM() {
    const networkInput = document.getElementById('flsm-network').value.trim();
    const originalCidr = parseInt(document.getElementById('flsm-original-cidr').value);
    const flsmMode = document.querySelector('.flsm-mode-btn.active').dataset.mode;

    // Validate IP
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(networkInput)) {
        alert('Please enter a valid network IP address (e.g., 192.168.0.0)');
        return;
    }

    const octets = networkInput.split('.').map(Number);
    if (octets.some(o => o < 0 || o > 255)) {
        alert('Each octet must be between 0 and 255');
        return;
    }

    let newCidr, bitsBorrowed, subnetsToGenerate;
    const availableHostBits = 32 - originalCidr;

    if (flsmMode === 'strict') {
        // Strict FLSM: By Subnets or By Hosts
        const requirementType = document.querySelector('.req-toggle-btn.active').dataset.req;

        if (requirementType === 'subnets') {
            const subnetsNeeded = parseInt(document.getElementById('flsm-subnets').value);
            if (!subnetsNeeded || subnetsNeeded < 1) {
                alert('Please enter the number of subnets needed');
                return;
            }
            // Calculate bits to borrow: 2^n >= subnetsNeeded
            bitsBorrowed = Math.ceil(Math.log2(subnetsNeeded));
            if (bitsBorrowed > availableHostBits) {
                alert(`Cannot create ${subnetsNeeded} subnets. Maximum with /${originalCidr} is ${Math.pow(2, availableHostBits)} subnets.`);
                return;
            }
            newCidr = originalCidr + bitsBorrowed;
            subnetsToGenerate = Math.pow(2, bitsBorrowed);
        } else {
            const hostsNeeded = parseInt(document.getElementById('flsm-hosts').value);
            if (!hostsNeeded || hostsNeeded < 1) {
                alert('Please enter the number of hosts needed per subnet');
                return;
            }
            // Calculate host bits needed: 2^h - 2 >= hostsNeeded
            const hostBitsNeeded = Math.ceil(Math.log2(hostsNeeded + 2));
            newCidr = 32 - hostBitsNeeded;
            if (newCidr <= originalCidr) {
                alert(`Cannot accommodate ${hostsNeeded} hosts per subnet with /${originalCidr} network.`);
                return;
            }
            bitsBorrowed = newCidr - originalCidr;
            subnetsToGenerate = Math.pow(2, bitsBorrowed);
        }
    } else {
        // Hybrid FLSM: Hosts + Subnet Count
        // First calculate bits for hosts, then verify subnet count fits
        const hostsNeeded = parseInt(document.getElementById('flsm-hybrid-hosts').value);
        const subnetsNeeded = parseInt(document.getElementById('flsm-hybrid-subnets').value);

        if (!hostsNeeded || hostsNeeded < 1) {
            alert('Please enter the number of hosts per subnet');
            return;
        }
        if (!subnetsNeeded || subnetsNeeded < 1) {
            alert('Please enter the number of subnets needed');
            return;
        }

        // Calculate host bits needed: 2^h - 2 >= hostsNeeded
        const hostBitsNeeded = Math.ceil(Math.log2(hostsNeeded + 2));
        newCidr = 32 - hostBitsNeeded;

        if (newCidr <= originalCidr) {
            alert(`Cannot accommodate ${hostsNeeded} hosts per subnet with /${originalCidr} network.`);
            return;
        }

        bitsBorrowed = newCidr - originalCidr;
        const maxSubnets = Math.pow(2, bitsBorrowed);

        if (subnetsNeeded > maxSubnets) {
            alert(`Cannot create ${subnetsNeeded} subnets with ${hostsNeeded} hosts each in a /${originalCidr} network.\nMaximum subnets possible: ${maxSubnets}`);
            return;
        }

        // Generate only the requested number of subnets
        subnetsToGenerate = subnetsNeeded;
    }

    const hostsPerSubnet = Math.pow(2, 32 - newCidr);
    const usableHosts = hostsPerSubnet - 2;
    const blockSize = hostsPerSubnet;
    const newMask = cidrToMaskMap[newCidr];

    // Update info panel
    document.getElementById('flsm-bits-borrowed').textContent = bitsBorrowed;
    document.getElementById('flsm-new-cidr').textContent = '/' + newCidr;
    document.getElementById('flsm-new-mask').textContent = newMask;
    document.getElementById('flsm-total-subnets').textContent = subnetsToGenerate.toLocaleString();
    document.getElementById('flsm-hosts-per-subnet').textContent = hostsPerSubnet.toLocaleString();
    document.getElementById('flsm-usable-hosts').textContent = usableHosts.toLocaleString();
    document.getElementById('flsm-block-size').textContent = blockSize.toLocaleString();

    // Generate subnets table
    const networkInt = ipToInt(networkInput);
    const mask = cidrToMask(originalCidr);
    const baseNetwork = (networkInt & mask) >>> 0;

    const tbody = document.getElementById('flsm-table-body');
    tbody.innerHTML = '';

    const maxSubnetsToShow = Math.min(subnetsToGenerate, 256);

    for (let i = 0; i < maxSubnetsToShow; i++) {
        const subnetNetwork = baseNetwork + (i * blockSize);
        const subnetBroadcast = subnetNetwork + blockSize - 1;
        const subnetFirst = subnetNetwork + 1;
        const subnetLast = subnetBroadcast - 1;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${intToIp(subnetNetwork)}/${newCidr}</td>
            <td>${newMask}</td>
            <td>${intToIp(subnetFirst)}</td>
            <td>${intToIp(subnetLast)}</td>
            <td>${intToIp(subnetBroadcast)}</td>
            <td>${usableHosts.toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    }

    // Show results
    document.getElementById('flsm-results').style.display = 'block';
}

// VLSM Mode Toggle
document.querySelectorAll('.vlsm-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.vlsm-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        document.getElementById('vlsm-strict-input').style.display = mode === 'strict' ? 'block' : 'none';
        document.getElementById('vlsm-hybrid-input').style.display = mode === 'hybrid' ? 'block' : 'none';
    });
});

// VLSM Calculator
function calculateVLSM() {
    const networkInput = document.getElementById('vlsm-network').value.trim();
    const originalCidr = parseInt(document.getElementById('vlsm-original-cidr').value);
    const vlsmMode = document.querySelector('.vlsm-mode-btn.active').dataset.mode;

    // Validate IP
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(networkInput)) {
        alert('Please enter a valid network IP address (e.g., 192.168.1.0)');
        return;
    }

    const octets = networkInput.split('.').map(Number);
    if (octets.some(o => o < 0 || o > 255)) {
        alert('Each octet must be between 0 and 255');
        return;
    }

    let requirements = [];

    if (vlsmMode === 'strict') {
        // Strict VLSM: Only host requirements
        const requirementsText = document.getElementById('vlsm-requirements').value.trim();
        requirements = requirementsText
            .split('\n')
            .map(line => {
                const hosts = parseInt(line.trim());
                return { hosts, count: 1 };
            })
            .filter(r => !isNaN(r.hosts) && r.hosts > 0);

        if (requirements.length === 0) {
            alert('Please enter host requirements (one number per line)');
            return;
        }
    } else {
        // Hybrid Mode: Hosts + Subnet Count
        const hybridText = document.getElementById('vlsm-hybrid-requirements').value.trim();
        const lines = hybridText.split('\n').filter(line => line.trim());

        for (const line of lines) {
            const parts = line.split(',').map(p => parseInt(p.trim()));
            if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] > 0 && parts[1] > 0) {
                requirements.push({ hosts: parts[0], count: parts[1] });
            } else if (parts.length === 1 && !isNaN(parts[0]) && parts[0] > 0) {
                requirements.push({ hosts: parts[0], count: 1 });
            }
        }

        if (requirements.length === 0) {
            alert('Please enter requirements in format: hosts,count (one per line)\nExample: 60,2 means 60 hosts × 2 subnets');
            return;
        }
    }

    // Expand requirements based on count and prepare for sorting
    const expandedReqs = [];
    let subnetIdx = 1;
    requirements.forEach((req, groupIdx) => {
        for (let i = 0; i < req.count; i++) {
            expandedReqs.push({
                hosts: req.hosts,
                originalIdx: subnetIdx++,
                groupIdx: groupIdx + 1,
                subnetInGroup: i + 1
            });
        }
    });

    // Sort by hosts needed (descending) - VLSM allocates largest first
    const sortedReqs = [...expandedReqs].sort((a, b) => b.hosts - a.hosts);

    // Calculate subnets
    const networkInt = ipToInt(networkInput);
    const mask = cidrToMask(originalCidr);
    const baseNetwork = (networkInt & mask) >>> 0;
    const totalAvailableIPs = Math.pow(2, 32 - originalCidr);

    let currentNetwork = baseNetwork;
    let totalAllocated = 0;
    const allocations = [];

    for (const req of sortedReqs) {
        // Calculate required host bits: 2^h - 2 >= hostsNeeded
        const hostBitsNeeded = Math.ceil(Math.log2(req.hosts + 2));
        const subnetCidr = 32 - hostBitsNeeded;
        const subnetSize = Math.pow(2, hostBitsNeeded);

        // Align to subnet boundary
        const alignedNetwork = Math.ceil(currentNetwork / subnetSize) * subnetSize;

        if (alignedNetwork + subnetSize > baseNetwork + totalAvailableIPs) {
            alert(`Not enough address space for subnet requiring ${req.hosts} hosts`);
            return;
        }

        const subnetBroadcast = alignedNetwork + subnetSize - 1;
        const subnetFirst = alignedNetwork + 1;
        const subnetLast = subnetBroadcast - 1;
        const usableHosts = subnetSize - 2;
        const wasted = usableHosts - req.hosts;

        allocations.push({
            subnetNum: req.originalIdx,
            groupIdx: req.groupIdx,
            subnetInGroup: req.subnetInGroup,
            hostsNeeded: req.hosts,
            network: alignedNetwork,
            cidr: subnetCidr,
            mask: cidrToMaskMap[subnetCidr],
            first: subnetFirst,
            last: subnetLast,
            broadcast: subnetBroadcast,
            allocated: usableHosts,
            wasted: wasted
        });

        totalAllocated += subnetSize;
        currentNetwork = alignedNetwork + subnetSize;
    }

    // Sort back by original order for display
    allocations.sort((a, b) => a.subnetNum - b.subnetNum);

    // Calculate totals
    const totalHostsNeeded = expandedReqs.reduce((a, b) => a + b.hosts, 0);
    const totalWasted = allocations.reduce((sum, a) => sum + a.wasted, 0);
    const efficiency = ((totalHostsNeeded / totalAllocated) * 100).toFixed(1);

    // Update summary
    document.getElementById('vlsm-total-subnets').textContent = expandedReqs.length;
    document.getElementById('vlsm-total-ips').textContent = totalAvailableIPs.toLocaleString();
    document.getElementById('vlsm-allocated-ips').textContent = totalAllocated.toLocaleString();
    document.getElementById('vlsm-wasted-ips').textContent = totalWasted.toLocaleString();
    document.getElementById('vlsm-efficiency').textContent = efficiency + '%';

    // Generate table
    const tbody = document.getElementById('vlsm-table-body');
    tbody.innerHTML = '';

    allocations.forEach(alloc => {
        const row = document.createElement('tr');
        const subnetLabel = vlsmMode === 'hybrid'
            ? `Group ${alloc.groupIdx} - Subnet ${alloc.subnetInGroup}`
            : `Subnet ${alloc.subnetNum}`;
        row.innerHTML = `
            <td>${subnetLabel}</td>
            <td>${alloc.hostsNeeded}</td>
            <td>${intToIp(alloc.network)}</td>
            <td>/${alloc.cidr}</td>
            <td>${alloc.mask}</td>
            <td>${intToIp(alloc.first)}</td>
            <td>${intToIp(alloc.last)}</td>
            <td>${intToIp(alloc.broadcast)}</td>
            <td>${alloc.allocated}</td>
            <td>${alloc.wasted}</td>
        `;
        tbody.appendChild(row);
    });

    // Show results
    document.getElementById('vlsm-results').style.display = 'block';
}

// Event Listeners for FLSM/VLSM
document.getElementById('flsm-calculate').addEventListener('click', calculateFLSM);
document.getElementById('vlsm-calculate').addEventListener('click', calculateVLSM);

// =============================================
// IPv6 PREFIX SUBNETTING CALCULATOR
// High-Performance Engine with Hexadecimal Calculations
// =============================================

// IPv6 Subnet State (for pagination)
let ipv6SubnetState = {
    baseAddress: null,
    currentPrefix: 0,
    targetPrefix: 0,
    totalSubnets: BigInt(0),
    currentPage: 1,
    pageSize: 100,
    totalPages: 1
};

// Parse IPv6 address to array of 8 hextets (16-bit numbers)
function parseIPv6(ip) {
    let parts = ip.split('::');
    let left = parts[0] ? parts[0].split(':').filter(p => p !== '') : [];
    let right = parts[1] ? parts[1].split(':').filter(p => p !== '') : [];
    let missing = 8 - left.length - right.length;
    let middle = Array(Math.max(0, missing)).fill('0');
    let full = [...left, ...middle, ...right];
    return full.map(p => parseInt(p || '0', 16));
}

// Convert hextets array to full expanded IPv6 string
function hextetsToFull(hextets) {
    return hextets.map(h => h.toString(16).padStart(4, '0')).join(':');
}

// RFC 5952 Compliant IPv6 Compression
function compressIPv6(hextets) {
    let parts = hextets.map(h => h.toString(16));

    // Find longest run of consecutive zeros
    let best = { start: -1, len: 0 };
    let curr = { start: -1, len: 0 };

    for (let i = 0; i < 8; i++) {
        if (parseInt(parts[i], 16) === 0) {
            if (curr.start === -1) curr.start = i;
            curr.len++;
        } else {
            if (curr.len > best.len && curr.len > 1) best = { ...curr };
            curr = { start: -1, len: 0 };
        }
    }
    if (curr.len > best.len && curr.len > 1) best = { ...curr };

    // Apply compression
    if (best.len > 1) {
        let result = [];
        for (let i = 0; i < 8; i++) {
            if (i === best.start) {
                result.push('');
                if (i === 0) result.unshift('');
            } else if (i > best.start && i < best.start + best.len) {
                continue;
            } else {
                result.push(parts[i]);
            }
        }
        if (best.start + best.len === 8) result.push('');
        return result.join(':');
    }
    return parts.join(':');
}

// Convert hextets to BigInt for calculations
function hextetsToBigInt(hextets) {
    let result = BigInt(0);
    for (let i = 0; i < 8; i++) {
        result = (result << BigInt(16)) | BigInt(hextets[i]);
    }
    return result;
}

// Convert BigInt back to hextets
function bigIntToHextets(bigint) {
    const hextets = [];
    for (let i = 7; i >= 0; i--) {
        hextets.unshift(Number((bigint >> BigInt(i * 16)) & BigInt(0xFFFF)));
    }
    return hextets;
}

// Add increment to IPv6 address (using BigInt)
function addToIPv6(hextets, increment) {
    const addr = hextetsToBigInt(hextets);
    const result = addr + increment;
    return bigIntToHextets(result);
}

// Format large numbers for display
function formatLargeNumber(bigint) {
    if (bigint <= BigInt(Number.MAX_SAFE_INTEGER)) {
        return Number(bigint).toLocaleString();
    }
    const str = bigint.toString();
    if (str.length <= 20) {
        return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    const exp = str.length - 1;
    const mantissa = str[0] + '.' + str.substring(1, 4);
    return `${mantissa}×10^${exp}`;
}

// Calculate IPs per subnet
function calculateIPsPerSubnet(targetPrefix) {
    return BigInt(2) ** BigInt(128 - targetPrefix);
}

// Generate subnet by index
function generateSubnet(baseHextets, currentPrefix, targetPrefix, subnetIndex) {
    const bitsBorrowed = targetPrefix - currentPrefix;
    const subnetSize = calculateIPsPerSubnet(targetPrefix);

    // Calculate subnet network address
    const baseAddr = hextetsToBigInt(baseHextets);
    const subnetOffset = subnetIndex * subnetSize;
    const subnetNetwork = baseAddr + subnetOffset;
    const subnetNetworkHextets = bigIntToHextets(subnetNetwork);

    // Calculate first host (network + 1)
    const firstHost = bigIntToHextets(subnetNetwork + BigInt(1));

    // Calculate last host (network + size - 2)
    const lastHost = bigIntToHextets(subnetNetwork + subnetSize - BigInt(2));

    // Generate subnet ID in hex
    const subnetIdHex = subnetIndex.toString(16).toUpperCase().padStart(Math.ceil(bitsBorrowed / 4), '0');

    return {
        index: subnetIndex,
        subnetIdHex: '0x' + subnetIdHex,
        network: compressIPv6(subnetNetworkHextets),
        networkFull: hextetsToFull(subnetNetworkHextets),
        firstHost: compressIPv6(firstHost),
        lastHost: compressIPv6(lastHost),
        totalIPs: formatLargeNumber(subnetSize)
    };
}

// Render IPv6 subnet table for current page
function renderIPv6SubnetTable() {
    const state = ipv6SubnetState;
    const tbody = document.getElementById('ipv6-subnet-table-body');
    tbody.innerHTML = '';

    const startIdx = BigInt((state.currentPage - 1) * state.pageSize);
    const endIdx = startIdx + BigInt(state.pageSize);
    const maxIdx = state.totalSubnets < endIdx ? state.totalSubnets : endIdx;

    for (let i = startIdx; i < maxIdx; i++) {
        const subnet = generateSubnet(
            state.baseAddress,
            state.currentPrefix,
            state.targetPrefix,
            i
        );

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${(i + BigInt(1)).toString()}</td>
            <td>${subnet.subnetIdHex}</td>
            <td>${subnet.network}/${state.targetPrefix}</td>
            <td>${subnet.firstHost}</td>
            <td>${subnet.lastHost}</td>
            <td>${subnet.totalIPs}</td>
        `;
        tbody.appendChild(row);
    }

    // Update pagination info
    const pageInfo = `Page ${state.currentPage} of ${state.totalPages.toLocaleString()}`;
    document.getElementById('ipv6-page-info').textContent = pageInfo;
    document.getElementById('ipv6-page-info-bottom').textContent = pageInfo;

    // Update button states
    const isFirstPage = state.currentPage === 1;
    const isLastPage = state.currentPage >= state.totalPages;

    document.getElementById('ipv6-first-page').disabled = isFirstPage;
    document.getElementById('ipv6-prev-page').disabled = isFirstPage;
    document.getElementById('ipv6-next-page').disabled = isLastPage;
    document.getElementById('ipv6-last-page').disabled = isLastPage;
    document.getElementById('ipv6-first-page-bottom').disabled = isFirstPage;
    document.getElementById('ipv6-prev-page-bottom').disabled = isFirstPage;
    document.getElementById('ipv6-next-page-bottom').disabled = isLastPage;
    document.getElementById('ipv6-last-page-bottom').disabled = isLastPage;
}

// IPv6 Subnet Calculator Main Function
function calculateIPv6Subnets() {
    const baseInput = document.getElementById('ipv6-subnet-base').value.trim();
    const currentPrefix = parseInt(document.getElementById('ipv6-current-prefix').value);
    const targetPrefix = parseInt(document.getElementById('ipv6-target-prefix').value);

    // Validate inputs
    if (!baseInput) {
        alert('Please enter a base IPv6 network address');
        return;
    }

    // Basic IPv6 validation
    const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$|^([0-9a-fA-F]{0,4}:)*::([0-9a-fA-F]{0,4}:)*[0-9a-fA-F]{0,4}$/;
    if (!ipv6Pattern.test(baseInput) && !baseInput.includes('::')) {
        alert('Please enter a valid IPv6 address');
        return;
    }

    // Validate prefix relationship
    if (targetPrefix <= currentPrefix) {
        alert('Target prefix must be greater than current prefix');
        return;
    }

    if (targetPrefix > 128) {
        alert('Maximum prefix length is 128');
        return;
    }

    // Parse base address
    const baseHextets = parseIPv6(baseInput);

    // Calculate subnet information
    const bitsBorrowed = targetPrefix - currentPrefix;
    const totalSubnets = BigInt(2) ** BigInt(bitsBorrowed);
    const ipsPerSubnet = calculateIPsPerSubnet(targetPrefix);

    // SLAAC compatibility check
    const isSLAACCompatible = targetPrefix <= 64;

    // Update state for pagination
    ipv6SubnetState = {
        baseAddress: baseHextets,
        currentPrefix: currentPrefix,
        targetPrefix: targetPrefix,
        totalSubnets: totalSubnets,
        currentPage: 1,
        pageSize: 100,
        totalPages: Number(totalSubnets > BigInt(Number.MAX_SAFE_INTEGER) ?
            BigInt(Number.MAX_SAFE_INTEGER) :
            (totalSubnets + BigInt(99)) / BigInt(100))
    };

    // Cap total pages for very large ranges
    if (ipv6SubnetState.totalPages > 1000000) {
        ipv6SubnetState.totalPages = 1000000;
    }

    // Update info panel
    document.getElementById('ipv6s-bits-borrowed').textContent = bitsBorrowed;
    document.getElementById('ipv6s-total-subnets').textContent = formatLargeNumber(totalSubnets);
    document.getElementById('ipv6s-ips-per-subnet').textContent = formatLargeNumber(ipsPerSubnet);
    document.getElementById('ipv6s-new-prefix').textContent = '/' + targetPrefix;

    const slaacStatus = document.getElementById('ipv6s-slaac-status');
    const slaacWarning = document.getElementById('ipv6s-slaac-warning');

    if (isSLAACCompatible) {
        slaacStatus.textContent = '✅ Compatible';
        slaacStatus.className = 'info-value slaac-compatible';
        slaacWarning.style.display = 'none';
    } else {
        slaacStatus.textContent = '❌ Incompatible';
        slaacStatus.className = 'info-value slaac-incompatible';
        slaacWarning.style.display = 'block';
    }

    // Render first page of subnets
    renderIPv6SubnetTable();

    // Show results
    document.getElementById('ipv6-subnet-results').style.display = 'block';
}

// Pagination event handlers
function setupIPv6Pagination() {
    const goToPage = (page) => {
        if (page < 1) page = 1;
        if (page > ipv6SubnetState.totalPages) page = ipv6SubnetState.totalPages;
        ipv6SubnetState.currentPage = page;
        renderIPv6SubnetTable();
    };

    document.getElementById('ipv6-first-page').addEventListener('click', () => goToPage(1));
    document.getElementById('ipv6-prev-page').addEventListener('click', () => goToPage(ipv6SubnetState.currentPage - 1));
    document.getElementById('ipv6-next-page').addEventListener('click', () => goToPage(ipv6SubnetState.currentPage + 1));
    document.getElementById('ipv6-last-page').addEventListener('click', () => goToPage(ipv6SubnetState.totalPages));

    document.getElementById('ipv6-first-page-bottom').addEventListener('click', () => goToPage(1));
    document.getElementById('ipv6-prev-page-bottom').addEventListener('click', () => goToPage(ipv6SubnetState.currentPage - 1));
    document.getElementById('ipv6-next-page-bottom').addEventListener('click', () => goToPage(ipv6SubnetState.currentPage + 1));
    document.getElementById('ipv6-last-page-bottom').addEventListener('click', () => goToPage(ipv6SubnetState.totalPages));
}

// Initialize IPv6 Subnet Calculator
document.getElementById('ipv6-subnet-calculate').addEventListener('click', calculateIPv6Subnets);
setupIPv6Pagination();
