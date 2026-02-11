-include .env

fuji_check:
	@forge clean
	@forge script script/DeployFuji.s.sol:DeployFuji \
		--rpc-url $(FUJI_RPC_URL) \
		--private-key $(PRIVATE_KEY) -vv

fuji_deploy:
	@forge clean
	@forge script script/DeployFuji.s.sol:DeployFuji \
		--rpc-url $(FUJI_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast --verify --slow \
		--verifier-url "https://api.avascan.info/v2/network/testnet/evm/43113/etherscan" \
		--etherscan-api-key $(SNOWTRACE_API_KEY) -vv
