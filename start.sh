sudo iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-ports 8080
export PUBLIC_HOSTNAME=$(curl http://169.254.169.254/latest/meta-data/public-hostname &2>/dev/null)
coffee server/index.coffee&
