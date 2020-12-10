const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	// 入口文件
    entry: './src/index.js',
    output: {
        filename: 'bundle.[hash].js',
        path: path.join(__dirname, '/dist')
    },
    mode: 'development',
    devtool: 'inline-source-map',
    // 配置服务端目录和端口
    devServer: {
        contentBase: './dist',
        port: 3123
    },
    module: {
    	// 配置相应的规则
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader']
            }, {
                test: /\.js[x]?$/,
                use: 'babel-loader',
                exclude: /node_modules/
            }, {
                test: /\.less$/,
                use: ['style-loader',
                    { loader: 'css-loader', options: { importLoaders: 1 } },
                    'less-loader'],
            }
        ]
    },
    // 配置相应的插件
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        new CleanWebpackPlugin()
    ]
};