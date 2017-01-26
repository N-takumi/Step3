#!/bin/sh
echo ".DS_Storeを削除します"
find ./ -name '*.DS_Store'

find ./ -name '*.DS_Store' | xargs rm
echo "お掃除完了しました"
