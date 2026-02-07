/**
 * Substitui variáveis por dados reais do produto
 */
export const substituteVariables = (text: string, product: any | null): string => {
    if (!product || !text) return text;

    // Mapeamento de variáveis suportadas
    // Mapeamento de variáveis suportadas
    const getValue = (key: string): string => {
        const k = key.toLowerCase();
        let val = '';
        switch (k) {
            case 'nome': val = product.nome || product.name || ''; break;
            case 'codigo': val = String(product.codigoProprio || product.codigo || product.code || ''); break;
            case 'sku': val = String(product.codigoProprio || product.sku || product.codigo || ''); break;
            case 'codigobarras': val = String(product.codigoBarras || product.barcode || ''); break;
            case 'preco': val = product.preco ? `R$ ${typeof product.preco === 'number' ? product.preco.toFixed(2) : product.preco}` : ''; break;
            case 'descricao': val = product.descricao || product.description || ''; break;
            case 'categoria': val = typeof product.categoria === 'object' ? (product.categoria.nome || '') : (product.categoria || product.category || ''); break;
            case 'marca': val = product.marca || product.brand || ''; break;
            case 'estoque': val = product.estoque?.toString() || ''; break;
            default: val = '';
        }
        console.log(`🔄 Substituindo ${key} -> "${val}" (Produto: ${product.nome})`);
        return val;
    };

    // Regex para encontrar padrões:
    // \$\{([^}]+)\}  -> captura ${nome}, ${codigo}
    // \$([a-zA-Z]+)  -> captura $nome, $codigo
    return text.replace(/(\$\{([^}]+)\})|(\$([a-zA-Z]+))/g, (match, _p1, p2, _p3, p4) => {
        // p2 é o conteúdo dentro de ${ }
        // p4 é o conteúdo após $
        const variableName = p2 || p4;
        if (variableName) {
            const value = getValue(variableName);
            // Se encontrou valor (ou string vazia válida), retorna
            // Se não encontrou mapeamento, mantém o original
            return value !== undefined ? value : match;
        }
        return match;
    });
};
