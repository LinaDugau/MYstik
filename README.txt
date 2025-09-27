скачиваем https://github.com/coreybutler/nvm-windows/releases
zapret libo vpn i dalshe:
perezapusi powershell
nvm install 20.19.4
nvm use 20.19.4
pip install nodeenv
nodeenv --node=20.19.4 env  
. env/Scripts/activate
node -v
npm install --force
npm install -g expo-cli
npm install react@19.1.0 
npm install react-dom@19.1.0 --legacy-peer-deps
node -v        # должно быть 20.19.4
npm -v         # должно быть 10.8.2
powershell -c "irm bun.sh/install.ps1 | iex"
перезапускаем павершел
переходим в директорию проекта
запустить:
bun start --web --tunnel





