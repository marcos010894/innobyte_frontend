import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  createUsuario, 
  updateUsuario, 
  getUsuarioById 
} from '../../services';
import type { 
  CreateUsuarioData, 
  UpdateUsuarioData
} from '../../types/api.types';

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateUsuarioData>({
    cnpj: '',
    razao_social: '',
    telefone: '',
    email: '',
    senha: '',
    tipo_licenca: 'contrato',
    intervalo: 'mensal',
    limite_empresas: 1,
    valor_parcela: 0,
    data_inicio: '',
    data_expiracao: '',
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadUsuario(parseInt(id));
    }
  }, [id]);

  const loadUsuario = async (usuarioId: number) => {
    setLoadingData(true);
    const result = await getUsuarioById(usuarioId);
    
    if (result.success && result.data) {
      const detail = result.data;
      setFormData({
        cnpj: detail.usuario.cnpj,
        razao_social: detail.usuario.razao_social,
        telefone: detail.usuario.telefone,
        email: detail.usuario.email,
        senha: '', // Senha não vem da API
        tipo_licenca: detail.licenca.tipo_licenca,
        intervalo: detail.licenca.intervalo,
        limite_empresas: detail.licenca.limite_empresas,
        valor_parcela: detail.licenca.valor_parcela,
        data_inicio: detail.licenca.data_inicio,
        data_expiracao: detail.licenca.data_expiracao,
        dia_vencimento: detail.licenca.dia_vencimento,
        baseado_contratacao: detail.licenca.baseado_contratacao,
        usuarios_adicionais: detail.licenca.usuarios_adicionais,
        bloqueada: detail.licenca.bloqueada,
        renovacao_automatica: detail.licenca.renovacao_automatica,
        apenas_modelos_pdf: detail.licenca.apenas_modelos_pdf,
        permite_token: detail.licenca.permite_token,
        permite_criar_modelos: detail.licenca.permite_criar_modelos,
        permite_cadastrar_produtos: detail.licenca.permite_cadastrar_produtos,
      });
    } else {
      setError(result.message || 'Erro ao carregar usuário');
    }
    
    setLoadingData(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    // Limpa erro do campo quando o usuário digita
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.razao_social.trim()) {
      errors.razao_social = 'Razão social é obrigatória';
    }

    if (!formData.email.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'E-mail inválido';
    }

    if (!isEditMode && !formData.senha) {
      errors.senha = 'Senha é obrigatória';
    } else if (formData.senha && formData.senha.length < 6) {
      errors.senha = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!formData.data_inicio) {
      errors.data_inicio = 'Data de início é obrigatória';
    }

    if (!formData.data_expiracao) {
      errors.data_expiracao = 'Data de expiração é obrigatória';
    }

    if (formData.limite_empresas < 1) {
      errors.limite_empresas = 'Limite de empresas deve ser no mínimo 1';
    }

    if (formData.valor_parcela < 0) {
      errors.valor_parcela = 'Valor da parcela não pode ser negativo';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      
      if (isEditMode && id) {
        // Modo edição - não envia senha se estiver vazia
        const updateData: UpdateUsuarioData = { ...formData };
        if (!updateData.senha) {
          delete updateData.senha;
        }
        result = await updateUsuario(parseInt(id), updateData);
      } else {
        // Modo criação
        result = await createUsuario(formData);
      }

      if (result.success) {
        alert(
          isEditMode 
            ? 'Usuário atualizado com sucesso!' 
            : 'Usuário criado com sucesso!'
        );
        navigate('/users');
      } else {
        setError(result.message || 'Erro ao salvar usuário');
      }
    } catch (err) {
      setError('Erro inesperado ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Deseja realmente cancelar? As alterações não serão salvas.')) {
      navigate('/users');
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <i className={`fas ${isEditMode ? 'fa-edit' : 'fa-plus-circle'} text-primary`}></i>
          {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode 
            ? 'Atualize as informações do usuário e licença' 
            : 'Preencha os dados para criar um novo usuário e licença'
          }
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <i className="fas fa-exclamation-circle text-red-500 text-xl"></i>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Dados do Cliente */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-user text-primary"></i>
            Dados do Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CNPJ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CNPJ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
                  fieldErrors.cnpj ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="00.000.000/0000-00"
              />
              {fieldErrors.cnpj && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.cnpj}</p>
              )}
            </div>

            {/* Razão Social */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razão Social <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="razao_social"
                value={formData.razao_social}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
                  fieldErrors.razao_social ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome da empresa"
              />
              {fieldErrors.razao_social && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.razao_social}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
                  fieldErrors.telefone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(00) 00000-0000"
              />
              {fieldErrors.telefone && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.telefone}</p>
              )}
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
                  fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@exemplo.com"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
                  fieldErrors.senha ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={isEditMode ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
              />
              {fieldErrors.senha && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.senha}</p>
              )}
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Deixe em branco para manter a senha atual
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dados da Licença */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-key text-primary"></i>
            Dados da Licença
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Licença */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Licença <span className="text-red-500">*</span>
              </label>
              <select
                name="tipo_licenca"
                value={formData.tipo_licenca}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              >
                <option value="contrato">Contrato</option>
                <option value="experiencia">Experiência</option>
                <option value="demonstracao">Demonstração</option>
              </select>
            </div>

            {/* Limite de Empresas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite de Empresas <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="limite_empresas"
                value={formData.limite_empresas}
                onChange={handleNumberChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
                  fieldErrors.limite_empresas ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.limite_empresas && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.limite_empresas}</p>
              )}
            </div>

            {/* Data de Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
                  fieldErrors.data_inicio ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.data_inicio && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.data_inicio}</p>
              )}
            </div>

            {/* Data de Expiração */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Expiração <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="data_expiracao"
                value={formData.data_expiracao}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
                  fieldErrors.data_expiracao ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.data_expiracao && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.data_expiracao}</p>
              )}
            </div>

            {/* Intervalo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo <span className="text-red-500">*</span>
              </label>
              <select
                name="intervalo"
                value={formData.intervalo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              >
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>

            {/* Valor da Parcela */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor da Parcela <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="valor_parcela"
                value={formData.valor_parcela}
                onChange={handleNumberChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 ${
                  fieldErrors.valor_parcela ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {fieldErrors.valor_parcela && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.valor_parcela}</p>
              )}
            </div>
          </div>
        </div>

        {/* Permissões (opcional - só aparecem em modo edição) */}
        {isEditMode && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-shield-alt text-primary"></i>
              Permissões e Configurações
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="bloqueada"
                  checked={formData.bloqueada || false}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Licença Bloqueada</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="renovacao_automatica"
                  checked={formData.renovacao_automatica || false}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Renovação Automática</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="permite_token"
                  checked={formData.permite_token || false}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Permite Token API</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="permite_criar_modelos"
                  checked={formData.permite_criar_modelos || false}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Permite Criar Modelos</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="permite_cadastrar_produtos"
                  checked={formData.permite_cadastrar_produtos || false}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Permite Cadastrar Produtos</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="apenas_modelos_pdf"
                  checked={formData.apenas_modelos_pdf || false}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Apenas Modelos PDF</span>
              </label>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Salvando...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {isEditMode ? 'Atualizar' : 'Criar Usuário'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
