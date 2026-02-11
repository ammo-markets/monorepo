# Resolve repo root: works whether invoked from root (make -C) or locally
CONTRACTS_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
ROOT_DIR := $(abspath $(CONTRACTS_DIR)/../..)

-include $(ROOT_DIR)/.env

fuji_check:
	@cd $(CONTRACTS_DIR) && forge clean
	@cd $(CONTRACTS_DIR) && forge script script/DeployFuji.s.sol:DeployFuji \
		--rpc-url $(FUJI_RPC_URL) \
		--private-key $(PRIVATE_KEY) -vv

fuji_deploy:
	@cd $(CONTRACTS_DIR) && forge clean
	@cd $(CONTRACTS_DIR) && forge script script/DeployFuji.s.sol:DeployFuji \
		--rpc-url $(FUJI_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast --verify --slow \
		--verifier-url "https://api.avascan.info/v2/network/testnet/evm/43113/etherscan" \
		--etherscan-api-key $(SNOWTRACE_API_KEY) -vv
