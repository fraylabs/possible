#!/bin/sh
set -eu

fail() { printf 'possible: %s\n' "$*" >&2; exit 1; }
case "$(uname -s)" in
  Darwin) os=darwin ;;
  Linux) os=linux ;;
  *) fail 'Supported systems: macOS and Linux.' ;;
esac
case "$(uname -m)" in
  arm64|aarch64) arch=arm64 ;;
  x86_64|amd64) arch=x64 ;;
  *) fail 'Supported architectures: arm64 and x86_64.' ;;
esac
command -v curl >/dev/null 2>&1 || fail 'curl is required.'
command -v tar >/dev/null 2>&1 || fail 'tar is required.'
if command -v sha256sum >/dev/null 2>&1; then
  checksum=sha256sum
elif command -v shasum >/dev/null 2>&1; then
  checksum=shasum
else
  fail 'sha256sum or shasum is required.'
fi

repo=https://github.com/fraylabs/possible/releases
version=${POSSIBLE_VERSION:-}
if [ -z "$version" ]; then
  latest=$(curl -fsSL --proto '=https' --proto-redir '=https' --retry 3 -o /dev/null -w '%{url_effective}' "$repo/latest") || fail 'Could not resolve latest release.'
  version=${latest##*/}
fi
version=${version#v}
printf '%s\n' "$version" | LC_ALL=C grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' || fail 'POSSIBLE_VERSION must be a version such as 0.5.2 or v0.5.2.'
install_dir=${POSSIBLE_INSTALL_DIR:-${HOME:?HOME must be set}/.local/bin}
case "$install_dir" in /*) ;; *) install_dir=$(pwd)/$install_dir ;; esac
archive=possible-v$version-$os-$arch.tar.gz
base=$repo/download/v$version
umask 077
temp=$(mktemp -d "${TMPDIR:-/tmp}/possible-install.XXXXXXXX") || fail 'Could not create temporary directory.'
trap 'rm -rf "$temp"' 0
trap 'exit 1' HUP INT TERM
curl -fsSL --proto '=https' --proto-redir '=https' --retry 3 "$base/$archive" -o "$temp/$archive" || fail 'Download failed.'
curl -fsSL --proto '=https' --proto-redir '=https' --retry 3 "$base/SHA256SUMS" -o "$temp/SHA256SUMS" || fail 'Checksum download failed.'
expected=$(awk -v file="$archive" '$2 == file { print $1; count++ } END { if (count != 1) exit 1 }' "$temp/SHA256SUMS") || fail 'Release checksum is missing or ambiguous.'
[ "${#expected}" -eq 64 ] || fail 'Invalid release checksum.'
case "$expected" in *[!0-9a-f]*) fail 'Invalid release checksum.' ;; esac
if [ "$checksum" = sha256sum ]; then
  actual=$(sha256sum "$temp/$archive" | awk '{print $1}')
else
  actual=$(shasum -a 256 "$temp/$archive" | awk '{print $1}')
fi
[ "$actual" = "$expected" ] || fail 'SHA256 verification failed; nothing installed.'
tar -xzf "$temp/$archive" -C "$temp" possible || fail 'Could not extract executable.'
[ -f "$temp/possible" ] && [ ! -L "$temp/possible" ] || fail 'Archive does not contain a regular executable.'
mkdir -p "$install_dir" || fail "Cannot create $install_dir. Choose a writable POSSIBLE_INSTALL_DIR."
staged=$(mktemp "$install_dir/.possible.XXXXXXXX") || fail 'Install directory is not writable.'
trap 'rm -rf "$temp"; rm -f "$staged"' 0
cp "$temp/possible" "$staged"
chmod 755 "$staged"
mv -f "$staged" "$install_dir/possible"
printf 'Installed Possible %s to %s/possible (SHA256 verified).\n' "$version" "$install_dir"
case ":${PATH:-}:" in
  *":$install_dir:"*) ;;
  *) printf 'Add this directory to your PATH:\n  export PATH="%s:$PATH"\n' "$install_dir" ;;
esac
