<?php

namespace ADM\QuickDevBar\Console\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Magento\Framework\Exception\LocalizedException;


class SalesRule extends Command
{
    protected $_repository;
    protected $_searchBuilder;

    public function __construct(
        \Magento\SalesRule\Api\RuleRepositoryInterface $ruleRepositoryInterface,
        \Magento\Framework\Api\SearchCriteriaBuilder $searchCriteriaBuilder,
        $name = null
    )
    {
        $this->_repository = $ruleRepositoryInterface;
        $this->_searchBuilder = $searchCriteriaBuilder;
        parent::__construct();
    }

    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this->setName('devbar:salesrule:clear')
            ->setDescription('Clear all sales rule');
        parent::configure();
    }

    /**
     * {@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        try {
            $ruleList = $this->_repository->getList($this->_searchBuilder->create());
            foreach ($ruleList->getItems() as $rule) {
                $ruleId = $rule->getRuleId();
                $this->_repository->deleteById($ruleId);
                $output->writeln("Promotion rule: {$ruleId} is deleted");
            }

        } catch (\Exception $e) {
            $output->writeln('<error>' . $e->getMessage() . '</error>');
            if ($output->getVerbosity() >= OutputInterface::VERBOSITY_VERBOSE) {
                $output->writeln($e->getTraceAsString());
            }
            return;
        }
    }
}