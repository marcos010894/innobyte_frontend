import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ClientDataForm from '@components/users/ClientDataForm';
import LicenseDataForm from '@components/users/LicenseDataForm';
import CompanyInfoForm from '@components/users/CompanyInfoForm';
import { getUsuarioById, createUsuario, updateUsuario, getEmpresas } from '../services';
import { removerMascara, validarCNPJ, validarEmail, validarData } from '../utils/validation';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  // Estados para coletar dados dos forms filhos
  const [clientData, setClientData] = useState<any>({
    cnpj: '',
    razaoSocial: '',
    telefone: '',
    email: '',
    senha: '',
  });

  const [licenseData, setLicenseData] = useState<any>({
    tipoLicenca: 'contrato',
    dataInicio: '',
    dataExpiracao: '',
    intervalo: 'mensal',
    usuariosAdicionais: 0,
    valorParcela: 0,
    bloqueado: false,
    renovacaoAutomatica: false,
    apenasModelosPDF: false,
    permiteToken: true,
    permiteCriarModelos: true,
    permiteCadastrarProdutos: true,
  });

  const [companyInfo, setCompanyInfo] = useState<any>({
    inscricao_estadual: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    estado: '',
    cidade: '',
    emails: [],
    telefones: [],
  });

  useEffect(() => {
    if (isEditing && id) {
      loadUsuario(Number(id));
    }
  }, [id, isEditing]);

  const loadUsuario = async (usuarioId: number) => {
    setLoading(true);
    setError('');
    
    const result = await getUsuarioById(usuarioId);
    
    if (result.success && result.data) {
      const { usuario, licenca } = result.data;
      const usuarioData: any = usuario;
      
      console.log('📥 Dados do usuário recebidos:', {
        usuario: usuarioData,
        licenca,
      });
      
      setClientData({
        cnpj: usuarioData.cnpj || '',
        razaoSocial: usuarioData.razao_social || '',
        telefone: usuarioData.telefone || '',
        email: usuarioData.email || '',
        senha: '',
      });

      setLicenseData({
        tipoLicenca: licenca.tipo_licenca || 'contrato',
        dataInicio: licenca.data_inicio || '',
        dataExpiracao: licenca.data_expiracao || '',
        intervalo: licenca.intervalo || 'mensal',
        usuariosAdicionais: licenca.usuarios_adicionais || 0,
        valorParcela: licenca.valor_parcela || 0,
        bloqueado: licenca.bloqueada || false,
        renovacaoAutomatica: licenca.renovacao_automatica || false,
        apenasModelosPDF: licenca.apenas_modelos_pdf || false,
        permiteToken: licenca.permite_token || true,
        permiteCriarModelos: licenca.permite_criar_modelos || true,
        permiteCadastrarProdutos: licenca.permite_cadastrar_produtos || true,
      });

      // Busca empresas do usuário
      const empresasResult = await getEmpresas(usuarioId);
      
      if (empresasResult.success && empresasResult.data?.data && empresasResult.data.data.length > 0) {
        const empresa = empresasResult.data.data[0]; // Pega a primeira empresa
        
        console.log('🏢 Dados da empresa recebidos:', empresa);
        
        setCompanyInfo({
          // Nome Fantasia, Razão Social e CNPJ vêm do ClientDataForm
          inscricao_estadual: empresa.inscricao_estadual || '',
          cep: empresa.cep || '',
          logradouro: empresa.logradouro || '',
          numero: empresa.numero || '',
          complemento: empresa.complemento || '',
          bairro: empresa.bairro || '',
          estado: empresa.estado || '',
          cidade: empresa.cidade || '',
          emails: empresa.emails || [],
          telefones: empresa.telefones || [],
        });
      } else {
        console.log('⚠️ Usuário não possui empresa cadastrada');
        // Deixa campos vazios se não houver empresa
        setCompanyInfo({
          inscricao_estadual: '',
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          estado: '',
          cidade: '',
          emails: [],
          telefones: [],
        });
      }

      console.log('✅ Dados carregados no estado');
    } else {
      setError(result.message || 'Erro ao carregar usuário');
    }
    
    setLoading(false);
  };

  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const newFieldErrors: Record<string, boolean> = {};

    const cnpjLimpo = removerMascara(clientData.cnpj);
    if (!cnpjLimpo || !validarCNPJ(cnpjLimpo)) {
      errors.push('CNPJ inválido');
      newFieldErrors['cnpj'] = true;
    }

    if (!clientData.razaoSocial || clientData.razaoSocial.length < 3) {
      errors.push('Razão social deve ter pelo menos 3 caracteres');
      newFieldErrors['razaoSocial'] = true;
    }

    if (!clientData.email || !validarEmail(clientData.email)) {
      errors.push('E-mail inválido');
      newFieldErrors['email'] = true;
    }

    if (!isEditing && (!clientData.senha || clientData.senha.length < 6)) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
      newFieldErrors['senha'] = true;
    }

    if (!licenseData.dataInicio || !validarData(licenseData.dataInicio)) {
      errors.push('Data de início inválida');
      newFieldErrors['dataInicio'] = true;
    }

    if (!licenseData.dataExpiracao || !validarData(licenseData.dataExpiracao)) {
      errors.push('Data de expiração inválida');
      newFieldErrors['dataExpiracao'] = true;
    }

    if (licenseData.dataInicio && licenseData.dataExpiracao) {
      if (new Date(licenseData.dataExpiracao) <= new Date(licenseData.dataInicio)) {
        errors.push('Data de expiração deve ser posterior à data de início');
        newFieldErrors['dataExpiracao'] = true;
      }
    }

    if (licenseData.valorParcela <= 0) {
      errors.push('Valor da parcela deve ser maior que zero');
      newFieldErrors['valorParcela'] = true;
    }

    setFieldErrors(newFieldErrors);

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const handleSave = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      toast.error('Preencha todos os campos obrigatórios corretamente');
      return;
    }

    setSaving(true);
    setError('');
    setFieldErrors({}); // Limpa os erros ao salvar
    
    const dadosUsuario = {
      cnpj: removerMascara(clientData.cnpj),
      razao_social: clientData.razaoSocial,
      telefone: removerMascara(clientData.telefone),
      email: clientData.email,
      ...(clientData.senha && { senha: clientData.senha }),
      tipo_licenca: licenseData.tipoLicenca as 'contrato' | 'experiencia' | 'demonstracao',
      data_inicio: licenseData.dataInicio,
      data_expiracao: licenseData.dataExpiracao,
      intervalo: licenseData.intervalo as 'mensal' | 'trimestral' | 'semestral' | 'anual',
      limite_empresas: 10,
      usuarios_adicionais: licenseData.usuariosAdicionais,
      valor_parcela: licenseData.valorParcela,
      bloqueada: licenseData.bloqueado,
      renovacao_automatica: licenseData.renovacaoAutomatica,
      apenas_modelos_pdf: licenseData.apenasModelosPDF,
      permite_token: licenseData.permiteToken,
      permite_criar_modelos: licenseData.permiteCriarModelos,
      permite_cadastrar_produtos: licenseData.permiteCadastrarProdutos,
    };

    // Adiciona empresa como objeto separado (conforme nova estrutura da API)
    const temDadosEmpresa = companyInfo.cep || companyInfo.logradouro || 
                            companyInfo.emails?.length > 0 || companyInfo.telefones?.length > 0;

    if (temDadosEmpresa) {
      (dadosUsuario as any).empresa = {
        // Usa SEMPRE os dados do ClientDataForm (onde o CNPJ é consultado)
        nome_fantasia: clientData.razaoSocial, // Nome fantasia = Razão Social consultada
        razao_social: clientData.razaoSocial,  // Razão social já vem da consulta CNPJ
        cnpj: removerMascara(clientData.cnpj), // CNPJ do cliente
        inscricao_estadual: companyInfo.inscricao_estadual || '',
        cep: removerMascara(companyInfo.cep),
        logradouro: companyInfo.logradouro,
        numero: companyInfo.numero,
        complemento: companyInfo.complemento || '',
        bairro: companyInfo.bairro,
        cidade: companyInfo.cidade,
        estado: companyInfo.estado,
        emails: companyInfo.emails?.length > 0 ? companyInfo.emails : [clientData.email],
        telefones: companyInfo.telefones?.length > 0 ? companyInfo.telefones : [removerMascara(clientData.telefone)],
      };
    }

    console.log('📤 Dados sendo enviados para a API:', dadosUsuario);

    let result;
    if (isEditing && id) {
      result = await updateUsuario(Number(id), dadosUsuario);
    } else {
      result = await createUsuario(dadosUsuario);
    }

    if (result.success) {
      toast.success(isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
      navigate('/users');
    } else {
      setError(result.message || 'Erro ao salvar usuário');
      toast.error(result.message || 'Erro ao salvar usuário');
    }
    
    setSaving(false);
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            <i className={`fas ${isEditing ? 'fa-edit' : 'fa-user-plus'} mr-2 text-primary`}></i>
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Edite as informações do usuário e licença abaixo' : 'Preencha os dados para criar um novo usuário e sua licença'}
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i>
          Voltar
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <i className="fas fa-exclamation-circle text-red-500 text-xl"></i>
          <div>
            <h3 className="font-semibold text-red-800 mb-1">Erro</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ClientDataForm 
              data={clientData} 
              onChange={setClientData}
              onCompanyDataFetched={setCompanyInfo}
              fieldErrors={fieldErrors}
            />
            <LicenseDataForm 
              data={licenseData} 
              onChange={setLicenseData}
              fieldErrors={fieldErrors}
            />
          </div>

          <div className="space-y-6">
            <CompanyInfoForm data={companyInfo} onChange={setCompanyInfo} />
          </div>
        </div>

      

        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <i className="fas fa-times"></i>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-success text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Salvando...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
