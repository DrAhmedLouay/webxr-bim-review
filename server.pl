#!/usr/bin/perl
use strict;
use warnings;
use IO::Socket::INET;

$| = 1;
my $port = 8888;
my $server = IO::Socket::INET->new(
    LocalPort => $port,
    Type      => SOCK_STREAM,
    Reuse     => 1,
    Listen    => 10
) or die "Could not start server on port $port: $!\n";

print "BIM WebXR Server running on http://localhost:$port\n";

my %mimes = (
    'html' => 'text/html; charset=utf-8',
    'js'   => 'application/javascript; charset=utf-8',
    'css'  => 'text/css; charset=utf-8',
    'json' => 'application/json',
    'wasm' => 'application/wasm',
    'glb'  => 'model/gltf-binary',
    'gltf' => 'model/gltf+json',
    'ifc'  => 'application/octet-stream',
    'png'  => 'image/png',
    'jpg'  => 'image/jpeg',
    'svg'  => 'image/svg+xml'
);

while (my $client = $server->accept()) {
    my $req = <$client>;
    next unless defined $req;
    
    if ($req =~ /^GET\s+([^\s\?]+)/) {
        my $path = $1;
        $path = '/index.html' if $path eq '/';
        $path =~ s/^\///;
        
        # Prevent directory traversal
        $path =~ s/\.\.//g;

        if (-f $path) {
            my ($ext) = $path =~ /\.([^.]+)$/;
            my $ctype = $mimes{lc($ext || '')} || 'application/octet-stream';
            my $size = -s $path;
            
            if (open my $fh, '<:raw', $path) {
                print $client "HTTP/1.1 200 OK\r\n";
                print $client "Content-Type: $ctype\r\n";
                print $client "Content-Length: $size\r\n";
                print $client "Access-Control-Allow-Origin: *\r\n";
                print $client "Connection: close\r\n\r\n";
                
                my $buf;
                while (read($fh, $buf, 65536)) {
                    print $client $buf;
                }
                close $fh;
            } else {
                print $client "HTTP/1.1 500 Internal Error\r\nConnection: close\r\n\r\n";
            }
        } else {
            print $client "HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n404 Not Found";
        }
    }
    close $client;
}
