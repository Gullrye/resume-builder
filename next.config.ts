import type { NextConfig } from "next";
import { networkInterfaces } from "os";

// Auto-detect LAN IPs for dev server HMR access
function getLanIps(): string[] {
  const ips: string[] = [];
  for (const iface of Object.values(networkInterfaces())) {
    if (!iface) continue;
    for (const addr of iface) {
      if (addr.family === "IPv4" && !addr.internal) {
        ips.push(addr.address);
      }
    }
  }
  return ips;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getLanIps(),
};

export default nextConfig;
