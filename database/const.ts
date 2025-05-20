import path from "path";

export const CONFIG_PATH = path.join(__dirname, "config.yaml");

export const COLLATERAL_COINS = [
  // "haSUI_SUI_CETUS_VT_LP",
  "vSUI",
  "gSUI",
  "SCA",
  "spSUI",
  "swUSDT",
  // "stSUI_SUI_ALPHAFI_FT",
  "sUSDC",
  "sSCA",
  "CETUS",
  "WETH",
  "sDEEP",
  "USDY",
  "SUI",
  "sSUI",
  "afSUI",
  "mSUI",
  // "sbWBTC",
  "BTC",
  "wUSDT",
  "sbETH",
  "sSBETH",
  "DEEP",
  "haSUI",
  "WAL",
  "wWAL",
  "sWAL",
  "haWAL",
  "sSBUSDT",
  "wUSDC",
  "NAVX",
  "stSUI",
  "swUSDC",
] as const;

export const COINS = [
  "SUI",
  "WAL",
  "USDC",
  "USDT",
  "BTC",
  "ETH",
  "vSUI",
  "afSUI",
  "haSUI",
  "spSUI",
  "mSUI",
  "gSUI",
  "HAWAL",
  "WWAL",
  "CETUS",
  "USDY",
  "WETH",
  "sbETH",
  "NAVX",
  "CETUS_STABLE_LP",
  "FLOWX_STABLE_LP",
  "BLUEFIN_STABLE_LP",
  "MMT_STABLE_LP",
  "SCALLOP_STABLE_SCOIN",
  "stSUI",
  "DEEP",
  "FDUSD",
  "wUSDC",
  "wUSDT",
  "BUCK",
  "AUSD",
  "USDCbnb",
  "USDCsol",
  "USDCarb",
  "USDCpol",
  "USDCarb",
  "SCA",
  "sUSDC",
  "swUSDC",
  "sSUI",
  "sSCA",
  "swUSDT",
  "sSBETH",
  "sDEEP",
  "sSBUSDT",
  // "sWAL",
  "wCELO",
  "wMATIC",
  "wBNB",
  "wBTC",
  "wAVAX",
  "wFTM",
  "wGLMR",
  "wSOL",
  "AF_LP_USDC_BUCK",
  "AF_LP_SUI_BUCK",
] as const;

export type TokenSymbol = (typeof COLLATERAL_COINS)[number];

interface TokenInfo {
  address: string;
  symbol: TokenSymbol;
  decimal: number;
}

export const ADDRESS_TOKEN_INFO_MAPPING: Record<
  string,
  Omit<TokenInfo, "address">
> = {
  "0x0000000000000000000000000000000000000000000000000000000000000002": {
    symbol: "SUI",
    decimal: 9,
  },
  "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59": {
    symbol: "WAL",
    decimal: 9,
  },
  // >>> SUI LST
  "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55": {
    symbol: "vSUI",
    decimal: 9,
  },
  "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc": {
    symbol: "afSUI",
    decimal: 9,
  },
  "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d": {
    symbol: "haSUI",
    decimal: 9,
  },
  "0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf": {
    symbol: "spSUI",
    decimal: 9,
  },
  "0x922d15d7f55c13fd790f6e54397470ec592caa2b508df292a2e8553f3d3b274f": {
    symbol: "mSUI",
    decimal: 9,
  },
  "0x2f2226a22ebeb7a0e63ea39551829b238589d981d1c6dd454f01fcc513035593": {
    symbol: "gSUI",
    decimal: 9,
  },
  // <<< SUI LST
  // >>> WAL LST
  "0x8b4d553839b219c3fd47608a0cc3d5fcc572cb25d41b7df3833208586a8d2470": {
    symbol: "HAWAL",
    decimal: 9,
  },
  "0xb1b0650a8862e30e3f604fd6c5838bc25464b8d3d827fbd58af7cb9685b832bf": {
    symbol: "WWAL",
    decimal: 9,
  },
  // <<< WAL LST
  "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b": {
    symbol: "CETUS",
    decimal: 9,
  },
  "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb": {
    symbol: "USDY",
    decimal: 6,
  },
  "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5": {
    symbol: "WETH",
    decimal: 8,
  },
  "0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29": {
    symbol: "sbETH",
    decimal: 8,
  },
  "0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5": {
    symbol: "NAVX",
    decimal: 9,
  },
  "0x8d1aee27f8537c06d19c16641f27008caafc42affd2d2fb7adb96919470481ec": {
    symbol: "CETUS_STABLE_LP",
    decimal: 9,
  },
  "0xcffc684610db2d1956cfb25858678be8ea96d2766b4c756d4096abd38461f40a": {
    symbol: "FLOWX_STABLE_LP",
    decimal: 6,
  },
  "0x6b110c792faadf8c1f928ad351bf3c9abad647b12bab83e7e075c169b0f9a2c1": {
    symbol: "BLUEFIN_STABLE_LP",
    decimal: 9,
  },
  "0x375e22e22157b643553d4e327ccf59fa8149605b90ab81c3645261f8e21bc879": {
    symbol: "MMT_STABLE_LP",
    decimal: 9,
  },

  "0x08a7a3c873402d7cf9d44192aae337e0b27a72c2a4a230d10230488cf614c5a2": {
    symbol: "SCALLOP_STABLE_SCOIN",
    decimal: 6,
  },
  "0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55": {
    symbol: "stSUI",
    decimal: 9,
  },
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270": {
    symbol: "DEEP",
    decimal: 6,
  },
  // >>> stablecoin
  "0xf16e6b723f242ec745dfd7634ad072c42d5c1d9ac9d62a39c381303eaa57693a": {
    symbol: "FDUSD",
    decimal: 6,
  },
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7": {
    symbol: "USDC",
    decimal: 6,
  },
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf": {
    symbol: "wUSDC",
    decimal: 6,
  },
  "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c": {
    symbol: "wUSDT",
    decimal: 6,
  },
  "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2": {
    symbol: "BUCK",
    decimal: 9,
  },
  "0x2053d08c1e2bd02791056171aab0fd12bd7cd7efad2ab8f6b9c8902f14df2ff2": {
    symbol: "AUSD",
    decimal: 6,
  },
  "0x909cba62ce96d54de25bec9502de5ca7b4f28901747bbf96b76c2e63ec5f1cba": {
    symbol: "USDCbnb",
    decimal: 6,
  },
  "0xb231fcda8bbddb31f2ef02e6161444aec64a514e2c89279584ac9806ce9cf037": {
    symbol: "USDCsol",
    decimal: 6,
  },
  "0xcf72ec52c0f8ddead746252481fb44ff6e8485a39b803825bde6b00d77cdb0bb": {
    symbol: "USDCpol",
    decimal: 6,
  },
  "0xe32d3ebafa42e6011b87ef1087bbc6053b499bf6f095807b9013aff5a6ecd7bb": {
    symbol: "USDCarb",
    decimal: 6,
  },
  // <<< stablecoin
  // >>> Scallop
  "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6": {
    symbol: "SCA",
    decimal: 9,
  },
  "0x854950aa624b1df59fe64e630b2ba7c550642e9342267a33061d59fb31582da5": {
    symbol: "sUSDC",
    decimal: 6,
  },
  "0xad4d71551d31092230db1fd482008ea42867dbf27b286e9c70a79d2a6191d58d": {
    symbol: "swUSDC",
    decimal: 6,
  },
  "0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b": {
    symbol: "sSUI",
    decimal: 9,
  },
  "0x5ca17430c1d046fae9edeaa8fd76c7b4193a00d764a0ecfa9418d733ad27bc1e": {
    symbol: "sSCA",
    decimal: 9,
  },
  "0xe6e5a012ec20a49a3d1d57bd2b67140b96cd4d3400b9d79e541f7bdbab661f95": {
    symbol: "swUSDT",
    decimal: 6,
  },
  "0xb14f82d8506d139eacef109688d1b71e7236bcce9b2c0ad526abcd6aa5be7de0": {
    symbol: "sSBETH",
    decimal: 8,
  },
  "0xeb7a05a3224837c5e5503575aed0be73c091d1ce5e43aa3c3e716e0ae614608f": {
    symbol: "sDEEP",
    decimal: 6,
  },
  "0xb1d7df34829d1513b73ba17cb7ad90c88d1e104bb65ab8f62f13e0cc103783d3": {
    symbol: "sSBUSDT",
    decimal: 6,
  },
  "0x622345b3f80ea5947567760eec7b9639d0582adcfd6ab9fccb85437aeda7c0d0": {
    symbol: "sWAL",
    decimal: 9,
  },
  // <<< Scallop
  // >>> Wrapped Token
  "0xa198f3be41cda8c07b3bf3fee02263526e535d682499806979a111e88a5a8d0f": {
    symbol: "wCELO",
    decimal: 8,
  },
  "0xdbe380b13a6d0f5cdedd58de8f04625263f113b3f9db32b3e1983f49e2841676": {
    symbol: "wMATIC",
    decimal: 8,
  },
  "0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f": {
    symbol: "wBNB",
    decimal: 8,
  },
  "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881": {
    symbol: "wBTC",
    decimal: 8,
  },
  "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b": {
    symbol: "BTC",
    decimal: 8,
  },
  "0x1e8b532cca6569cab9f9b9ebc73f8c13885012ade714729aa3b450e0339ac766": {
    symbol: "wAVAX",
    decimal: 8,
  },
  "0x6081300950a4f1e2081580e919c210436a1bed49080502834950d31ee55a2396": {
    symbol: "wFTM",
    decimal: 8,
  },
  "0x66f87084e49c38f76502d17f87d17f943f183bb94117561eb573e075fdc5ff75": {
    symbol: "wGLMR",
    decimal: 8,
  },
  "0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8": {
    symbol: "wSOL",
    decimal: 8,
  },
  // <<< Wrapped Token

  "0xf1b901d93cc3652ee26e8d88fff8dc7b9402b2b2e71a59b244f938a140affc5e": {
    symbol: "AF_LP_USDC_BUCK",
    decimal: 6,
  },
  "0x62e39f5554a2badccab46bf3fab044e3f7dc889d42a567a68d3c1b2e5463001f": {
    symbol: "AF_LP_SUI_BUCK",
    decimal: 9,
  },
};

export const COINS_TYPE_LIST: Record<TokenSymbol, string> = {
  SUI: "0x2::sui::SUI",
  USDC: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
  wUSDC:
    "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
  wUSDT:
    "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
  afSUI:
    "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
  haSUI:
    "0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI",
  vSUI: "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT",
  WETH: "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN",
  USDCbnb:
    "0x909cba62ce96d54de25bec9502de5ca7b4f28901747bbf96b76c2e63ec5f1cba::coin::COIN",
  USDCsol:
    "0xb231fcda8bbddb31f2ef02e6161444aec64a514e2c89279584ac9806ce9cf037::coin::COIN",
  USDCpol:
    "0xcf72ec52c0f8ddead746252481fb44ff6e8485a39b803825bde6b00d77cdb0bb::coin::COIN",
  USDCarb:
    "0xe32d3ebafa42e6011b87ef1087bbc6053b499bf6f095807b9013aff5a6ecd7bb::coin::COIN",
  BUCK: "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK",
  BKT: "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::bkt::BKT",
  BUCKETUS:
    "0x8d1aee27f8537c06d19c16641f27008caafc42affd2d2fb7adb96919470481ec::bucketus::BUCKETUS",
  USDY: "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY",
  NAVX: "0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX",
  SCA: "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
  SCABLE:
    "0x08a7a3c873402d7cf9d44192aae337e0b27a72c2a4a230d10230488cf614c5a2::scable::SCABLE",
  STAPEARL:
    "0xcffc684610db2d1956cfb25858678be8ea96d2766b4c756d4096abd38461f40a::stapearl::STAPEARL",
  sBUCK:
    "0x1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884::sbuck::SBUCK",
  CETUS:
    "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS",
  AUSD: "0x2053d08c1e2bd02791056171aab0fd12bd7cd7efad2ab8f6b9c8902f14df2ff2::ausd::AUSD",
  sSUI: "0xaafc4f740de0dd0dde642a31148fb94517087052f19afb0f7bed1dc41a50c77b::scallop_sui::SCALLOP_SUI",
  sSCA: "0x5ca17430c1d046fae9edeaa8fd76c7b4193a00d764a0ecfa9418d733ad27bc1e::scallop_sca::SCALLOP_SCA",
  sUSDC:
    "0x854950aa624b1df59fe64e630b2ba7c550642e9342267a33061d59fb31582da5::scallop_usdc::SCALLOP_USDC",
  swUSDC:
    "0xad4d71551d31092230db1fd482008ea42867dbf27b286e9c70a79d2a6191d58d::scallop_wormhole_usdc::SCALLOP_WORMHOLE_USDC",
  swUSDT:
    "0xe6e5a012ec20a49a3d1d57bd2b67140b96cd4d3400b9d79e541f7bdbab661f95::scallop_wormhole_usdt::SCALLOP_WORMHOLE_USDT",
  sSBETH:
    "0xb14f82d8506d139eacef109688d1b71e7236bcce9b2c0ad526abcd6aa5be7de0::scallop_sb_eth::SCALLOP_SB_ETH",
  spSUI:
    "0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI",
  mSUI: "0x922d15d7f55c13fd790f6e54397470ec592caa2b508df292a2e8553f3d3b274f::msui::MSUI",
  KOTO: "0xa99166e802527eeb5439cbda12b0a02851bf2305d3c96a592b1440014fcb8975::koto::KOTO",
  sbETH:
    "0xd0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH",
  FDUSD:
    "0xf16e6b723f242ec745dfd7634ad072c42d5c1d9ac9d62a39c381303eaa57693a::fdusd::FDUSD",
  AF_LP_USDC_BUCK:
    "0xf1b901d93cc3652ee26e8d88fff8dc7b9402b2b2e71a59b244f938a140affc5e::af_lp::AF_LP",
  AF_LP_SUI_BUCK:
    "0x62e39f5554a2badccab46bf3fab044e3f7dc889d42a567a68d3c1b2e5463001f::af_lp::AF_LP",
  stSUI:
    "0xd1b72982e40348d069bb1ff701e634c117bb5f741f44dff91e472d3b01461e55::stsui::STSUI",
  BUT: "0xbc858cb910b9914bee64fff0f9b38855355a040c49155a17b265d9086d256545::but::BUT",
  sbUSDT:
    "0x375f70cf2ae4c00bf37117d0c85a2c71545e6ee05c4a5c7d282cd66a4504b068::usdt::USDT",
  DEEP: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
  sDEEP:
    "0xeb7a05a3224837c5e5503575aed0be73c091d1ce5e43aa3c3e716e0ae614608f::scallop_deep::SCALLOP_DEEP",
  sSBUSDT:
    "0xb1d7df34829d1513b73ba17cb7ad90c88d1e104bb65ab8f62f13e0cc103783d3::scallop_sb_usdt::SCALLOP_SB_USDT",
  gSUI: "0x2f2226a22ebeb7a0e63ea39551829b238589d981d1c6dd454f01fcc513035593::house::StakedHouseCoin<0x2::sui::SUI>",
  haSUI_SUI_CETUS_VT_LP:
    "0x828b452d2aa239d48e4120c24f4a59f451b8cd8ac76706129f4ac3bd78ac8809::lp_token::LP_TOKEN",
  stSUI_SUI_ALPHAFI_FT:
    "0x96eb2012a75798ce4410392baeab9dd888bc704799b7daa468c36856c83174f3::ALPHAFI_STSUI_SUI_LP::ALPHAFI_STSUI_SUI_LP",
  sbWBTC:
    "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
  bluefin_BUCK_USDC_LP:
    "0x6b110c792faadf8c1f928ad351bf3c9abad647b12bab83e7e075c169b0f9a2c1::bluefin_stable_lp::BLUEFIN_STABLE_LP",
  WAL: "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL",
  sWAL: "0x622345b3f80ea5947567760eec7b9639d0582adcfd6ab9fccb85437aeda7c0d0::scallop_wal::SCALLOP_WAL",
  MMT_STABLE_LP:
    "0x375e22e22157b643553d4e327ccf59fa8149605b90ab81c3645261f8e21bc879::mmt_stable_lp::MMT_STABLE_LP",
  wWAL: "0xb1b0650a8862e30e3f604fd6c5838bc25464b8d3d827fbd58af7cb9685b832bf::wwal::WWAL",
  haWAL:
    "0x8b4d553839b219c3fd47608a0cc3d5fcc572cb25d41b7df3833208586a8d2470::hawal::HAWAL",
};

export const EVENT_TABLES = {
  MOLE_SAVING: {
      DEPOSIT: 'Mole_Saving_Deposit',
      WITHDRAW: 'Mole_Saving_Withdraw'
  },
  MOLE_FARM: {
      DEPOSIT: 'Mole_Farm_Deposit',
      WITHDRAW: 'Mole_Farm_Withdraw'
  },
  NAVI: {
      DEPOSIT: 'Navi_Deposit',
      WITHDRAW: 'Navi_Withdraw'
  }
} as const; 
