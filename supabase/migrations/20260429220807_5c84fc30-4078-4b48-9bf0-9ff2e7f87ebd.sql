INSERT INTO public.institution_fees (institution,reference_year,reference_month,period_label,descricao,taxa,n_apartamentos,valor) VALUES
('FPD',2016,1,'Janeiro de 2016','Taxa de condomínio',1000.0,80,80000.0),
('FPD',2016,2,'Fevereiro de 2016','Taxa de condomínio',1000.0,80,80000.0),
('FPD',2016,3,'Março de 2016','Taxa de condomínio',1000.0,80,80000.0),
('FPD',2016,4,'Abril de 2016','Taxa de condomínio',1000.0,80,80000.0),
('FPD',2016,5,'Maio de 2016','Taxa de condomínio',1000.0,80,80000.0),
('FPD',2016,6,'Junho de 2016','Taxa de condomínio',1000.0,80,80000.0),
('FPD',2016,7,'Julho de 2016','Taxa de condomínio',1000.0,80,80000.0),
('FPD',2016,8,'Agosto de 2016','Taxa de condomínio',1000.0,80,80000.0),
('FPD',2016,9,'Setembro de 2016','Taxa de condomínio',1000.0,80,80000.0),
('FPD',2016,10,'Outubro de 2016','Taxa de condomínio',1000.0,80,80000.0),
('FPD',2016,11,'Novembro de 2016','Taxa de condomínio',1000.0,80,80000.0),
('FPD',2016,12,'Dezembro de 2016','Taxa de condomínio',1000.0,80,80000.0)
ON CONFLICT (institution, reference_year, reference_month) DO UPDATE SET
  period_label = EXCLUDED.period_label,
  descricao = EXCLUDED.descricao,
  taxa = EXCLUDED.taxa,
  n_apartamentos = EXCLUDED.n_apartamentos,
  valor = EXCLUDED.valor,
  updated_at = now();